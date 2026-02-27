/**
 * PageIndex Service — Structures raw Mem0 memories into a hierarchical JSON tree.
 * Uses an LLM to consolidate flat facts into a browsable UserMap.
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
     * Uses the Gemini API via the local proxy to do the structuring.
     */
    async consolidate(memories: string[], existingTree?: PageNode): Promise<PageNode> {
        const memoryList = memories.map((m, i) => `${i + 1}. ${m}`).join('\n');

        let prompt = `Here are the user's raw memory facts:\n\n${memoryList}`;
        if (existingTree) {
            prompt += `\n\nHere is the existing UserMap tree to merge into:\n${JSON.stringify(existingTree, null, 2)}`;
            prompt += `\n\nMerge the new facts into the existing tree. Remove duplicates. Add new categories if needed.`;
        } else {
            prompt += `\n\nCreate a new UserMap tree from these facts.`;
        }

        // Call through the local proxy (using Gemini by default for structuring)
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                model: 'gemini-2.0-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { systemInstruction: STRUCTURING_PROMPT }
            })
        });

        if (!res.ok) {
            throw new Error(`Structuring failed: ${res.status}`);
        }

        const data = await res.json();
        const text = data.text || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse structured tree from LLM response');
        }

        return JSON.parse(jsonMatch[0]) as PageNode;
    }
}

export const pageIndexService = new PageIndexService();
