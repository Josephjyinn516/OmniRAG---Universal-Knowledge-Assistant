import { Document, EvaluationMetric } from "./types";

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Employee Remote Work Policy (Global)',
    type: 'PDF',
    content: `1. Purpose: This policy defines the guidelines for remote work eligibility for all employees globally.
2. Eligibility: Employees in "Hybrid" or "Remote-First" designated roles may work from home up to 4 days a week.
3. Core Hours: Regardless of location, employees must be available during core collaboration hours (10:00 AM - 3:00 PM local time).
4. Equipment: The company provides a one-time stipend of $1,000 for home office setup (monitor, chair, desk).`,
    uploadDate: '2024-02-10',
    active: true
  },
  {
    id: '2',
    title: 'Project Apollo - Product Specifications',
    type: 'Markdown',
    content: `## Project Apollo Overview
Project Apollo is our next-gen renewable energy storage solution.
### Technical Specs
- **Capacity**: 50kWh per unit (modular up to 1MWh)
- **Chemistry**: Lithium Iron Phosphate (LFP)
- **Warranty**: 15 years or 8,000 cycles
- **Inverter**: Integrated 10kW hybrid inverter
### Target Market
Primary focus is residential solar users in California and Australia. Launch date is Q3 2025.`,
    uploadDate: '2024-03-05',
    active: true
  },
  {
    id: '3',
    title: 'Customer Support Playbook - Refund Process',
    type: 'Text',
    content: `Standard Operating Procedure for Refunds:
1. Verify Purchase: Check Order ID in the CRM.
2. Eligibility Window: Refunds are only processed within 30 days of delivery.
3. Condition: Item must be unopened. If opened, a 15% restocking fee applies.
4. Approval: Refunds > $500 require Manager approval.
5. Timeline: Process refunds within 3-5 business days back to the original payment method.`,
    uploadDate: '2024-01-20',
    active: true
  }
];

export const INITIAL_METRICS: EvaluationMetric[] = [
  { name: 'Faithfulness', value: 0.92, trend: 'up', description: 'Accuracy of response against retrieved context.' },
  { name: 'Answer Relevancy', value: 0.88, trend: 'up', description: 'Relevance of the answer to the user query.' },
  { name: 'Context Precision', value: 0.76, trend: 'stable', description: 'Relevance of retrieved documents.' },
  { name: 'User Satisfaction', value: 4.5, trend: 'up', description: 'Average user feedback score (out of 5).' }
];