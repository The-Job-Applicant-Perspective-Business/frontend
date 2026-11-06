# QA Task: Homepage Navigation & Search State Audit

## Target URL

http://localhost:3000/

## Test Requirements

1. Navigate to '/' and verify the page loads with status 200.
2. In the desktop header, click 'Job App Tools' and verify the dropdown opens.
3. Verify the dropdown contains links for:
   - Career Fairs (/career-fairs)
   - AI Tools Audit (/ai-tools)
   - Self Care Tools (/self-care-tools)
   - Financial Support (/us-govt-financial-support)
4. Verify the TabbedInterface:
   - Click the 'Hiring Feedback' tab button.
   - Verify the URL updates to include '?tab=review'.
   - Click the 'Classified' tab button.
   - Verify the URL updates to include '?tab=classified'.
5. In the Classified search input:
   - Type 'nonexistentjobquery'
   - Verify the empty state shows 'No results found' or '0 jobs found ?'.
