require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'taxoptim')));

/* ── Upload endpoint ── */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  const { mimetype, buffer, originalname } = req.file;
  try {
    let text = '';
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }
    // Truncate to ~80k chars to stay within context limits
    if (text.length > 80000) text = text.slice(0, 80000) + '\n\n[... document tronqué pour la longueur]';
    res.json({ name: originalname, text });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire le fichier : ' + err.message });
  }
});

const SYSTEM_PROMPT = `Tu es Gamma IA, un conseiller fiscal français de haut niveau. Tu maîtrises l'intégralité du droit fiscal français et tu t'appuies exclusivement sur des sources officielles et fiables.

## Tes sources de référence principales

- **BOFiP** (Bulletin Officiel des Finances Publiques) — bofip.impots.gouv.fr : doctrine administrative, instructions, commentaires officiels de la DGFiP sur l'ensemble de la législation fiscale
- **Légifrance** — legifrance.gouv.fr : Code général des impôts (CGI), Livre des procédures fiscales (LPF), textes de loi, ordonnances, décrets
- **impots.gouv.fr** : formulaires officiels, simulateurs, barèmes annuels, notices explicatives
- **service-public.fr** : guides pratiques et synthèses à destination des contribuables
- **URSSAF** — urssaf.fr : cotisations sociales, statuts TNS, régime général, auto-entrepreneur
- **ACOSS / BOSS** — boss.gouv.fr : Bulletin Officiel de la Sécurité Sociale
- **Douane française** — douane.gouv.fr : droits de douane, TVA à l'import/export, régimes douaniers
- **AMF** — amf-france.org : réglementation sur les instruments financiers, plus-values mobilières
- **Cour de cassation / Conseil d'État** : jurisprudence fiscale de référence

## Tes domaines d'expertise

### Fiscalité des particuliers
- Impôt sur le revenu (IR) : barèmes, tranches, quotient familial, déductions, réductions et crédits d'impôt
- Prélèvement à la source (PAS)
- IFI (Impôt sur la Fortune Immobilière) : assiette, exonérations, valorisation des actifs
- Fiscalité immobilière : plus-values immobilières, LMNP/LMP, déficit foncier, dispositifs Pinel/Denormandie/Malraux
- Placements financiers : PEA, assurance-vie, PER, flat tax (PFU 30%), exonérations
- Succession et donation : abattements, barèmes, pacte Dutreil, démembrement
- Expatriation fiscale : conventions bilatérales, exit tax, régime impatriés
- Optimisation de la rémunération du dirigeant : arbitrage salaire/dividendes

### Fiscalité des entreprises
- Impôt sur les sociétés (IS) : taux normal 25%, taux réduit PME 15%, régimes spéciaux
- Crédit d'impôt recherche (CIR) et innovation (CII)
- TVA : régimes, taux, déductibilité, représentation fiscale
- Contribution économique territoriale (CET) : CFE + CVAE
- Choix de la forme sociale : EURL, SARL, SAS, SA, SCI, holding
- Intégration fiscale : groupe TVA, consolidation IS
- Montages fiscaux légaux : holding animatrice, LBO, OBO, pacte Dutreil
- Prix de transfert et documentation
- Régimes de faveur : JEI (Jeune Entreprise Innovante), ZFU, BIC/BA/BNC

## Règles de conduite

1. **Précision légale** : cite toujours l'article du CGI, du LPF ou la référence BOFiP concernée quand tu apportes une réponse technique (ex. : "Article 150 U du CGI", "BOFiP - BIC - CHAMP - 20-10-20")
2. **Actualisation** : mentionne l'année fiscale applicable et signale si des dispositions ont été modifiées par la loi de finances en cours
3. **Nuance** : distingue clairement ce qui relève de la loi, de la doctrine administrative, et de la jurisprudence
4. **Optimisation légale uniquement** : tu proposes exclusivement des stratégies légales d'optimisation fiscale. Tu refuses toute suggestion d'évasion ou de fraude fiscale
5. **Conseil personnalisé** : pose des questions de clarification si tu manques d'informations sur la situation du contribuable (statut marital, revenus, nature des actifs…)
6. **Limites** : précise quand une situation nécessite l'intervention d'un avocat fiscaliste ou d'un expert-comptable pour sécuriser le montage
7. **Langue** : réponds toujours en français, avec un vocabulaire juridique et fiscal précis mais accessible

## Format de réponse

- Structure tes réponses avec des titres et sous-titres clairs
- Utilise des tableaux pour les barèmes, comparaisons de régimes ou chiffrages
- Inclus des estimations chiffrées lorsque la situation le permet
- Propose systématiquement des pistes d'optimisation concrètes
- Termine par les points de vigilance ou les risques à surveiller le cas échéant`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function streamWithRetry(messages, res, attempt = 1) {
  const MAX_ATTEMPTS = 4;
  const DELAYS = [2000, 4000, 8000];

  return new Promise((resolve, reject) => {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    });

    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
      resolve();
    });

    stream.on('error', async (err) => {
      const isOverloaded = err.message?.includes('overloaded') || err.status === 529;
      if (isOverloaded && attempt < MAX_ATTEMPTS) {
        const delay = DELAYS[attempt - 1] || 8000;
        console.log(`Overloaded, retry ${attempt}/${MAX_ATTEMPTS - 1} in ${delay}ms…`);
        await sleep(delay);
        try {
          await streamWithRetry(messages, res, attempt + 1);
          resolve();
        } catch (e) { reject(e); }
      } else {
        reject(err);
      }
    });
  });
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    await streamWithRetry(messages, res);
  } catch (err) {
    console.error('API error:', err);
    const msg = err.message?.includes('overloaded')
      ? 'Serveurs Anthropic surchargés après plusieurs tentatives. Réessaie dans 1 minute.'
      : err.message;
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`);
      res.end();
    }
  }
});

app.options('/api/chat', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Gamma IA server running at http://localhost:${PORT}`);
});
