/**
 * ASTRA Health - Local RAG (Offline Retrieval-Augmented Generation)
 * Retrieves relevant spaceflight medical guidelines and countermeasure protocols
 * without any external internet connection.
 */

import { KnowledgeDoc, MISSION_KNOWLEDGE_BASE } from '../data/missionKnowledge';

export function queryLocalKnowledgeBase(query: string, maxResults: number = 2): KnowledgeDoc[] {
  const terms = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  if (terms.length === 0) return [MISSION_KNOWLEDGE_BASE[0]];

  const scoredDocs = MISSION_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const docText = `${doc.title} ${doc.summary} ${doc.content} ${doc.keywords.join(' ')}`.toLowerCase();

    for (const term of terms) {
      if (doc.keywords.some(k => k.toLowerCase().includes(term))) {
        score += 5;
      }
      if (doc.title.toLowerCase().includes(term)) {
        score += 4;
      }
      if (docText.includes(term)) {
        score += 1;
      }
    }

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);

  // Return top matching docs with positive score
  const matches = scoredDocs.filter(item => item.score > 0).map(item => item.doc);
  return matches.length > 0 ? matches.slice(0, maxResults) : [MISSION_KNOWLEDGE_BASE[0]];
}
