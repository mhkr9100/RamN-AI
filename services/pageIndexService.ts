/**
 * PageIndex Service — Structures raw memories into a hierarchical JSON tree.
 * Uses the user's AI provider (via hybridGenerateContent) to consolidate facts.
 */

export interface PageNode {
    id: string;
    label: string;
    value?: string;
    source?: string;
    children: PageNode[];
}

const STRUCTURING_PROMPT = `You are a Context Structurer. Given a list of raw memory facts about a user, organize them into a clean hierarchical JSON tree.

RULES:
1. Group related facts under logical parent categories (e.g., "Business Goals", "Technical Preferences", "Personal Info")
2. Merge duplicate or similar facts
3. Use concise labels for nodes
4. The root should have 3-7 top-level categories
5. Each leaf node should have a "value" field with the actual information
6. Output ONLY valid JSON matching this schema:
{
  "id": "root",
  "label": "UserMap",
  "children": [
    {
      "id": "unique-id",
      "label": "Category Name",
      "children": [
        { "id": "unique-id", "label": "Fact Label", "value": "The actual information", "children": [] }
      ]
    }
  ]
}`;

export class PageIndexService {
    /**
     * Takes raw memories (flat strings) and structures them into a PageNode tree.
     * Uses hybridGenerateContent directly (no server proxy needed).
     */
    async consolidate(memories: string[], existingTree?: PageNode, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }): Promise<PageNode> {
        const { hybridGenerateContent, resolvePrismModel } = await import('./aiService');
        const memoryList = memories.map((m, i) => `${i + 1}. ${m}`).join('\n');

        let prompt = `Here are the user's raw memory facts:\n\n${memoryList}`;
        if (existingTree) {
            prompt += `\n\nHere is the existing UserMap tree to merge into:\n${JSON.stringify(existingTree, null, 2)}`;
            prompt += `\n\nMerge the new facts into the existing tree. Remove duplicates. Add new categories if needed.`;
        } else {
            prompt += `\n\nCreate a new UserMap tree from these facts.`;
        }

        const { model } = resolvePrismModel(userKeys);
        const res = await hybridGenerateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { systemInstruction: STRUCTURING_PROMPT }
        }, userKeys);

        const text = res.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse structured tree from LLM response');
        }

        return JSON.parse(jsonMatch[0]) as PageNode;
    }
}

export const pageIndexService = new PageIndexService();
