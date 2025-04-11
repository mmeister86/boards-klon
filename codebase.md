# .cursor/rules/cursor_rules.mdc

```mdc
---
description: Guidelines for creating and maintaining Cursor rules to ensure consistency and effectiveness.
globs: .cursor/rules/*.mdc
alwaysApply: true
---

- **Required Rule Structure:**
  \`\`\`markdown
  ---
  description: Clear, one-line description of what the rule enforces
  globs: path/to/files/*.ext, other/path/**/*
  alwaysApply: boolean
  ---

  - **Main Points in Bold**
    - Sub-points with details
    - Examples and explanations
  \`\`\`

- **File References:**
  - Use `[filename](mdc:path/to/file)` ([filename](mdc:filename)) to reference files
  - Example: [prisma.mdc](mdc:.cursor/rules/prisma.mdc) for rule references
  - Example: [schema.prisma](mdc:prisma/schema.prisma) for code references

- **Code Examples:**
  - Use language-specific code blocks
  \`\`\`typescript
  // ✅ DO: Show good examples
  const goodExample = true;
  
  // ❌ DON'T: Show anti-patterns
  const badExample = false;
  \`\`\`

- **Rule Content Guidelines:**
  - Start with high-level overview
  - Include specific, actionable requirements
  - Show examples of correct implementation
  - Reference existing code when possible
  - Keep rules DRY by referencing other rules

- **Rule Maintenance:**
  - Update rules when new patterns emerge
  - Add examples from actual codebase
  - Remove outdated patterns
  - Cross-reference related rules

- **Best Practices:**
  - Use bullet points for clarity
  - Keep descriptions concise
  - Include both DO and DON'T examples
  - Reference actual code over theoretical examples
  - Use consistent formatting across rules 
```

# .cursor/rules/dev_workflow.mdc

```mdc
---
description: Guide for using meta-development script (scripts/dev.js) to manage task-driven development workflows
globs: **/*
alwaysApply: true
---

- **Global CLI Commands**
  - Task Master now provides a global CLI through the `task-master` command
  - All functionality from `scripts/dev.js` is available through this interface
  - Install globally with `npm install -g claude-task-master` or use locally via `npx`
  - Use `task-master <command>` instead of `node scripts/dev.js <command>`
  - Examples:
    - `task-master list` instead of `node scripts/dev.js list`
    - `task-master next` instead of `node scripts/dev.js next`
    - `task-master expand --id=3` instead of `node scripts/dev.js expand --id=3`
  - All commands accept the same options as their script equivalents
  - The CLI provides additional commands like `task-master init` for project setup

- **Development Workflow Process**
  - Start new projects by running `task-master init` or `node scripts/dev.js parse-prd --input=<prd-file.txt>` to generate initial tasks.json
  - Begin coding sessions with `task-master list` to see current tasks, status, and IDs
  - Analyze task complexity with `task-master analyze-complexity --research` before breaking down tasks
  - Select tasks based on dependencies (all marked 'done'), priority level, and ID order
  - Clarify tasks by checking task files in tasks/ directory or asking for user input
  - View specific task details using `task-master show <id>` to understand implementation requirements
  - Break down complex tasks using `task-master expand --id=<id>` with appropriate flags
  - Clear existing subtasks if needed using `task-master clear-subtasks --id=<id>` before regenerating
  - Implement code following task details, dependencies, and project standards
  - Verify tasks according to test strategies before marking as complete
  - Mark completed tasks with `task-master set-status --id=<id> --status=done`
  - Update dependent tasks when implementation differs from original plan
  - Generate task files with `task-master generate` after updating tasks.json
  - Maintain valid dependency structure with `task-master fix-dependencies` when needed
  - Respect dependency chains and task priorities when selecting work
  - Report progress regularly using the list command

- **Task Complexity Analysis**
  - Run `node scripts/dev.js analyze-complexity --research` for comprehensive analysis
  - Review complexity report in scripts/task-complexity-report.json
  - Or use `node scripts/dev.js complexity-report` for a formatted, readable version of the report
  - Focus on tasks with highest complexity scores (8-10) for detailed breakdown
  - Use analysis results to determine appropriate subtask allocation
  - Note that reports are automatically used by the expand command

- **Task Breakdown Process**
  - For tasks with complexity analysis, use `node scripts/dev.js expand --id=<id>`
  - Otherwise use `node scripts/dev.js expand --id=<id> --subtasks=<number>`
  - Add `--research` flag to leverage Perplexity AI for research-backed expansion
  - Use `--prompt="<context>"` to provide additional context when needed
  - Review and adjust generated subtasks as necessary
  - Use `--all` flag to expand multiple pending tasks at once
  - If subtasks need regeneration, clear them first with `clear-subtasks` command

- **Implementation Drift Handling**
  - When implementation differs significantly from planned approach
  - When future tasks need modification due to current implementation choices
  - When new dependencies or requirements emerge
  - Call `node scripts/dev.js update --from=<futureTaskId> --prompt="<explanation>"` to update tasks.json

- **Task Status Management**
  - Use 'pending' for tasks ready to be worked on
  - Use 'done' for completed and verified tasks
  - Use 'deferred' for postponed tasks
  - Add custom status values as needed for project-specific workflows

- **Task File Format Reference**
  \`\`\`
  # Task ID: <id>
  # Title: <title>
  # Status: <status>
  # Dependencies: <comma-separated list of dependency IDs>
  # Priority: <priority>
  # Description: <brief description>
  # Details:
  <detailed implementation notes>
  
  # Test Strategy:
  <verification approach>
  \`\`\`

- **Command Reference: parse-prd**
  - Legacy Syntax: `node scripts/dev.js parse-prd --input=<prd-file.txt>`
  - CLI Syntax: `task-master parse-prd --input=<prd-file.txt>`
  - Description: Parses a PRD document and generates a tasks.json file with structured tasks
  - Parameters: 
    - `--input=<file>`: Path to the PRD text file (default: sample-prd.txt)
  - Example: `task-master parse-prd --input=requirements.txt`
  - Notes: Will overwrite existing tasks.json file. Use with caution.

- **Command Reference: update**
  - Legacy Syntax: `node scripts/dev.js update --from=<id> --prompt="<prompt>"`
  - CLI Syntax: `task-master update --from=<id> --prompt="<prompt>"`
  - Description: Updates tasks with ID >= specified ID based on the provided prompt
  - Parameters:
    - `--from=<id>`: Task ID from which to start updating (required)
    - `--prompt="<text>"`: Explanation of changes or new context (required)
  - Example: `task-master update --from=4 --prompt="Now we are using Express instead of Fastify."`
  - Notes: Only updates tasks not marked as 'done'. Completed tasks remain unchanged.

- **Command Reference: generate**
  - Legacy Syntax: `node scripts/dev.js generate`
  - CLI Syntax: `task-master generate`
  - Description: Generates individual task files in tasks/ directory based on tasks.json
  - Parameters: 
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
    - `--output=<dir>, -o`: Output directory (default: 'tasks')
  - Example: `task-master generate`
  - Notes: Overwrites existing task files. Creates tasks/ directory if needed.

- **Command Reference: set-status**
  - Legacy Syntax: `node scripts/dev.js set-status --id=<id> --status=<status>`
  - CLI Syntax: `task-master set-status --id=<id> --status=<status>`
  - Description: Updates the status of a specific task in tasks.json
  - Parameters:
    - `--id=<id>`: ID of the task to update (required)
    - `--status=<status>`: New status value (required)
  - Example: `task-master set-status --id=3 --status=done`
  - Notes: Common values are 'done', 'pending', and 'deferred', but any string is accepted.

- **Command Reference: list**
  - Legacy Syntax: `node scripts/dev.js list`
  - CLI Syntax: `task-master list`
  - Description: Lists all tasks in tasks.json with IDs, titles, and status
  - Parameters: 
    - `--status=<status>, -s`: Filter by status
    - `--with-subtasks`: Show subtasks for each task
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
  - Example: `task-master list`
  - Notes: Provides quick overview of project progress. Use at start of sessions.

- **Command Reference: expand**
  - Legacy Syntax: `node scripts/dev.js expand --id=<id> [--num=<number>] [--research] [--prompt="<context>"]`
  - CLI Syntax: `task-master expand --id=<id> [--num=<number>] [--research] [--prompt="<context>"]`
  - Description: Expands a task with subtasks for detailed implementation
  - Parameters:
    - `--id=<id>`: ID of task to expand (required unless using --all)
    - `--all`: Expand all pending tasks, prioritized by complexity
    - `--num=<number>`: Number of subtasks to generate (default: from complexity report)
    - `--research`: Use Perplexity AI for research-backed generation
    - `--prompt="<text>"`: Additional context for subtask generation
    - `--force`: Regenerate subtasks even for tasks that already have them
  - Example: `task-master expand --id=3 --num=5 --research --prompt="Focus on security aspects"`
  - Notes: Uses complexity report recommendations if available.

- **Command Reference: analyze-complexity**
  - Legacy Syntax: `node scripts/dev.js analyze-complexity [options]`
  - CLI Syntax: `task-master analyze-complexity [options]`
  - Description: Analyzes task complexity and generates expansion recommendations
  - Parameters:
    - `--output=<file>, -o`: Output file path (default: scripts/task-complexity-report.json)
    - `--model=<model>, -m`: Override LLM model to use
    - `--threshold=<number>, -t`: Minimum score for expansion recommendation (default: 5)
    - `--file=<path>, -f`: Use alternative tasks.json file
    - `--research, -r`: Use Perplexity AI for research-backed analysis
  - Example: `task-master analyze-complexity --research`
  - Notes: Report includes complexity scores, recommended subtasks, and tailored prompts.

- **Command Reference: clear-subtasks**
  - Legacy Syntax: `node scripts/dev.js clear-subtasks --id=<id>`
  - CLI Syntax: `task-master clear-subtasks --id=<id>`
  - Description: Removes subtasks from specified tasks to allow regeneration
  - Parameters:
    - `--id=<id>`: ID or comma-separated IDs of tasks to clear subtasks from
    - `--all`: Clear subtasks from all tasks
  - Examples:
    - `task-master clear-subtasks --id=3`
    - `task-master clear-subtasks --id=1,2,3`
    - `task-master clear-subtasks --all`
  - Notes: 
    - Task files are automatically regenerated after clearing subtasks
    - Can be combined with expand command to immediately generate new subtasks
    - Works with both parent tasks and individual subtasks

- **Task Structure Fields**
  - **id**: Unique identifier for the task (Example: `1`)
  - **title**: Brief, descriptive title (Example: `"Initialize Repo"`)
  - **description**: Concise summary of what the task involves (Example: `"Create a new repository, set up initial structure."`)
  - **status**: Current state of the task (Example: `"pending"`, `"done"`, `"deferred"`)
  - **dependencies**: IDs of prerequisite tasks (Example: `[1, 2]`)
    - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending)
    - This helps quickly identify which prerequisite tasks are blocking work
  - **priority**: Importance level (Example: `"high"`, `"medium"`, `"low"`)
  - **details**: In-depth implementation instructions (Example: `"Use GitHub client ID/secret, handle callback, set session token."`)
  - **testStrategy**: Verification approach (Example: `"Deploy and call endpoint to confirm 'Hello World' response."`)
  - **subtasks**: List of smaller, more specific tasks (Example: `[{"id": 1, "title": "Configure OAuth", ...}]`)

- **Environment Variables Configuration**
  - **ANTHROPIC_API_KEY** (Required): Your Anthropic API key for Claude (Example: `ANTHROPIC_API_KEY=sk-ant-api03-...`)
  - **MODEL** (Default: `"claude-3-7-sonnet-20250219"`): Claude model to use (Example: `MODEL=claude-3-opus-20240229`)
  - **MAX_TOKENS** (Default: `"4000"`): Maximum tokens for responses (Example: `MAX_TOKENS=8000`)
  - **TEMPERATURE** (Default: `"0.7"`): Temperature for model responses (Example: `TEMPERATURE=0.5`)
  - **DEBUG** (Default: `"false"`): Enable debug logging (Example: `DEBUG=true`)
  - **LOG_LEVEL** (Default: `"info"`): Console output level (Example: `LOG_LEVEL=debug`)
  - **DEFAULT_SUBTASKS** (Default: `"3"`): Default subtask count (Example: `DEFAULT_SUBTASKS=5`)
  - **DEFAULT_PRIORITY** (Default: `"medium"`): Default priority (Example: `DEFAULT_PRIORITY=high`)
  - **PROJECT_NAME** (Default: `"MCP SaaS MVP"`): Project name in metadata (Example: `PROJECT_NAME=My Awesome Project`)
  - **PROJECT_VERSION** (Default: `"1.0.0"`): Version in metadata (Example: `PROJECT_VERSION=2.1.0`)
  - **PERPLEXITY_API_KEY**: For research-backed features (Example: `PERPLEXITY_API_KEY=pplx-...`)
  - **PERPLEXITY_MODEL** (Default: `"sonar-medium-online"`): Perplexity model (Example: `PERPLEXITY_MODEL=sonar-large-online`)

- **Determining the Next Task**
  - Run `task-master next` to show the next task to work on
  - The next command identifies tasks with all dependencies satisfied
  - Tasks are prioritized by priority level, dependency count, and ID
  - The command shows comprehensive task information including:
    - Basic task details and description
    - Implementation details
    - Subtasks (if they exist)
    - Contextual suggested actions
  - Recommended before starting any new development work
  - Respects your project's dependency structure
  - Ensures tasks are completed in the appropriate sequence
  - Provides ready-to-use commands for common task actions

- **Viewing Specific Task Details**
  - Run `task-master show <id>` or `task-master show --id=<id>` to view a specific task
  - Use dot notation for subtasks: `task-master show 1.2` (shows subtask 2 of task 1)
  - Displays comprehensive information similar to the next command, but for a specific task
  - For parent tasks, shows all subtasks and their current status
  - For subtasks, shows parent task information and relationship
  - Provides contextual suggested actions appropriate for the specific task
  - Useful for examining task details before implementation or checking status

- **Managing Task Dependencies**
  - Use `task-master add-dependency --id=<id> --depends-on=<id>` to add a dependency
  - Use `task-master remove-dependency --id=<id> --depends-on=<id>` to remove a dependency
  - The system prevents circular dependencies and duplicate dependency entries
  - Dependencies are checked for existence before being added or removed
  - Task files are automatically regenerated after dependency changes
  - Dependencies are visualized with status indicators in task listings and files

- **Command Reference: add-dependency**
  - Legacy Syntax: `node scripts/dev.js add-dependency --id=<id> --depends-on=<id>`
  - CLI Syntax: `task-master add-dependency --id=<id> --depends-on=<id>`
  - Description: Adds a dependency relationship between two tasks
  - Parameters:
    - `--id=<id>`: ID of task that will depend on another task (required)
    - `--depends-on=<id>`: ID of task that will become a dependency (required)
  - Example: `task-master add-dependency --id=22 --depends-on=21`
  - Notes: Prevents circular dependencies and duplicates; updates task files automatically

- **Command Reference: remove-dependency**
  - Legacy Syntax: `node scripts/dev.js remove-dependency --id=<id> --depends-on=<id>`
  - CLI Syntax: `task-master remove-dependency --id=<id> --depends-on=<id>`
  - Description: Removes a dependency relationship between two tasks
  - Parameters:
    - `--id=<id>`: ID of task to remove dependency from (required)
    - `--depends-on=<id>`: ID of task to remove as a dependency (required)
  - Example: `task-master remove-dependency --id=22 --depends-on=21`
  - Notes: Checks if dependency actually exists; updates task files automatically

- **Command Reference: validate-dependencies**
  - Legacy Syntax: `node scripts/dev.js validate-dependencies [options]`
  - CLI Syntax: `task-master validate-dependencies [options]`
  - Description: Checks for and identifies invalid dependencies in tasks.json and task files
  - Parameters:
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
  - Example: `task-master validate-dependencies`
  - Notes: 
    - Reports all non-existent dependencies and self-dependencies without modifying files
    - Provides detailed statistics on task dependency state
    - Use before fix-dependencies to audit your task structure

- **Command Reference: fix-dependencies**
  - Legacy Syntax: `node scripts/dev.js fix-dependencies [options]`
  - CLI Syntax: `task-master fix-dependencies [options]`
  - Description: Finds and fixes all invalid dependencies in tasks.json and task files
  - Parameters:
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
  - Example: `task-master fix-dependencies`
  - Notes: 
    - Removes references to non-existent tasks and subtasks
    - Eliminates self-dependencies (tasks depending on themselves)
    - Regenerates task files with corrected dependencies
    - Provides detailed report of all fixes made

- **Command Reference: complexity-report**
  - Legacy Syntax: `node scripts/dev.js complexity-report [options]`
  - CLI Syntax: `task-master complexity-report [options]`
  - Description: Displays the task complexity analysis report in a formatted, easy-to-read way
  - Parameters:
    - `--file=<path>, -f`: Path to the complexity report file (default: 'scripts/task-complexity-report.json')
  - Example: `task-master complexity-report`
  - Notes: 
    - Shows tasks organized by complexity score with recommended actions
    - Provides complexity distribution statistics
    - Displays ready-to-use expansion commands for complex tasks
    - If no report exists, offers to generate one interactively

- **Command Reference: add-task**
  - CLI Syntax: `task-master add-task [options]`
  - Description: Add a new task to tasks.json using AI
  - Parameters:
    - `--file=<path>, -f`: Path to the tasks file (default: 'tasks/tasks.json')
    - `--prompt=<text>, -p`: Description of the task to add (required)
    - `--dependencies=<ids>, -d`: Comma-separated list of task IDs this task depends on
    - `--priority=<priority>`: Task priority (high, medium, low) (default: 'medium')
  - Example: `task-master add-task --prompt="Create user authentication using Auth0"`
  - Notes: Uses AI to convert description into structured task with appropriate details

- **Command Reference: init**
  - CLI Syntax: `task-master init`
  - Description: Initialize a new project with Task Master structure
  - Parameters: None
  - Example: `task-master init`
  - Notes: 
    - Creates initial project structure with required files
    - Prompts for project settings if not provided
    - Merges with existing files when appropriate
    - Can be used to bootstrap a new Task Master project quickly

- **Code Analysis & Refactoring Techniques**
  - **Top-Level Function Search**
    - Use grep pattern matching to find all exported functions across the codebase
    - Command: `grep -E "export (function|const) \w+|function \w+\(|const \w+ = \(|module\.exports" --include="*.js" -r ./`
    - Benefits:
      - Quickly identify all public API functions without reading implementation details
      - Compare functions between files during refactoring (e.g., monolithic to modular structure)
      - Verify all expected functions exist in refactored modules
      - Identify duplicate functionality or naming conflicts
    - Usage examples:
      - When migrating from `scripts/dev.js` to modular structure: `grep -E "function \w+\(" scripts/dev.js`
      - Check function exports in a directory: `grep -E "export (function|const)" scripts/modules/`
      - Find potential naming conflicts: `grep -E "function (get|set|create|update)\w+\(" -r ./`
    - Variations:
      - Add `-n` flag to include line numbers
      - Add `--include="*.ts"` to filter by file extension
      - Use with `| sort` to alphabetize results
    - Integration with refactoring workflow:
      - Start by mapping all functions in the source file
      - Create target module files based on function grouping
      - Verify all functions were properly migrated
      - Check for any unintentional duplications or omissions

```

# .cursor/rules/memory-bank.mdc

```mdc
---
description: Cursor Memory Bank Rules
globs:
alwaysApply: true
---

# Cursor's Memory Bank

I am Cursor, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of required core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

\`\`\`mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]
    
    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC
    
    AC --> P[progress.md]
\`\`\`

### Core Files (Required)
1. `projectbrief.md`
   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. `productContext.md`
   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. `activeContext.md`
   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations

4. `systemPatterns.md`
   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships

5. `techContext.md`
   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies

6. `progress.md`
   - What works
   - What's left to build
   - Current status
   - Known issues

### Additional Context
Create additional files/folders within memory-bank/ when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Core Workflows

### Plan Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read Memory Bank]
    ReadFiles --> CheckFiles{Files Complete?}
    
    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]
    
    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]
\`\`\`

### Act Mode
\`\`\`mermaid
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Rules[Update .cursor/rules/memory-bank.mdc if needed]
    Rules --> Execute[Execute Task]
    Execute --> Document[Document Changes]
\`\`\`

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

\`\`\`mermaid
flowchart TD
    Start[Update Process]
    
    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Update .cursor/rules/memory-bank.mdc]
        
        P1 --> P2 --> P3 --> P4
    end
    
    Start --> Process
\`\`\`

Note: When triggered by **update memory bank**, I MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

## Project Intelligence (.cursor/rules/memory-bank.mdc)

The .cursor/rules/memory-bank.mdc file is my learning journal for each project. It captures important patterns, preferences, and project intelligence that help me work more effectively. As I work with you and the project, I'll discover and document key insights that aren't obvious from the code alone.

\`\`\`mermaid
flowchart TD
    Start{Discover New Pattern}
    
    subgraph Learn [Learning Process]
        D1[Identify Pattern]
        D2[Validate with User]
        D3[Document in .cursor/rules/memory-bank.mdc]
    end
    
    subgraph Apply [Usage]
        A1[Read .cursor/rules/memory-bank.mdc]
        A2[Apply Learned Patterns]
        A3[Improve Future Work]
    end
    
    Start --> Learn
    Learn --> Apply
\`\`\`

### What to Capture
- Critical implementation paths
- User preferences and workflow
- Project-specific patterns
- Known challenges
- Evolution of project decisions
- Tool usage patterns

The format is flexible - focus on capturing valuable insights that help me work more effectively with you and the project. Think of .cursor/rules/memory-bank.mdc as a living document that grows smarter as we work together.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

# Planning
When asked to enter "Planner Mode" or using the /plan command, deeply reflect upon the changes being asked and analyze existing code to map the full scope of changes needed. Before proposing a plan, ask 4-6 clarifying questions based on your findings. Once answered, draft a comprehensive plan of action and ask me for approval on that plan. Once approved, implement all steps in that plan. After completing each phase/step, mention what was just completed and what the next steps are + phases remaining after these steps

```

# .cursor/rules/self_improve.mdc

```mdc
---
description: Guidelines for continuously improving Cursor rules based on emerging code patterns and best practices.
globs: **/*
alwaysApply: true
---

- **Rule Improvement Triggers:**
  - New code patterns not covered by existing rules
  - Repeated similar implementations across files
  - Common error patterns that could be prevented
  - New libraries or tools being used consistently
  - Emerging best practices in the codebase

- **Analysis Process:**
  - Compare new code with existing rules
  - Identify patterns that should be standardized
  - Look for references to external documentation
  - Check for consistent error handling patterns
  - Monitor test patterns and coverage

- **Rule Updates:**
  - **Add New Rules When:**
    - A new technology/pattern is used in 3+ files
    - Common bugs could be prevented by a rule
    - Code reviews repeatedly mention the same feedback
    - New security or performance patterns emerge

  - **Modify Existing Rules When:**
    - Better examples exist in the codebase
    - Additional edge cases are discovered
    - Related rules have been updated
    - Implementation details have changed

- **Example Pattern Recognition:**
  \`\`\`typescript
  // If you see repeated patterns like:
  const data = await prisma.user.findMany({
    select: { id: true, email: true },
    where: { status: 'ACTIVE' }
  });
  
  // Consider adding to [prisma.mdc](mdc:.cursor/rules/prisma.mdc):
  // - Standard select fields
  // - Common where conditions
  // - Performance optimization patterns
  \`\`\`

- **Rule Quality Checks:**
  - Rules should be actionable and specific
  - Examples should come from actual code
  - References should be up to date
  - Patterns should be consistently enforced

- **Continuous Improvement:**
  - Monitor code review comments
  - Track common development questions
  - Update rules after major refactors
  - Add links to relevant documentation
  - Cross-reference related rules

- **Rule Deprecation:**
  - Mark outdated patterns as deprecated
  - Remove rules that no longer apply
  - Update references to deprecated rules
  - Document migration paths for old patterns

- **Documentation Updates:**
  - Keep examples synchronized with code
  - Update references to external docs
  - Maintain links between related rules
  - Document breaking changes

Follow [cursor_rules.mdc](mdc:.cursor/rules/cursor_rules.mdc) for proper rule formatting and structure.
```

# .eslintrc.json

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
.npmrc

# Added by Claude Task Master
# Logs
logs
*.log
dev-debug.log
# Dependency directories
node_modules/
# Environment variables
.env
# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
# OS specific
# Task files
tasks.json
tasks/ 
```

# .npmrc

```
@tiptap-pro:registry=https://registry.tiptap.dev/
//registry.tiptap.dev/:_authToken=dgsjY1qVjclcBWt3SW/etLDGprRjY//itu0mqZX5Z2whJxsCP4mdxQDS9KVVa4XlUUjzKSd+h64CRfgqQtKmJA==

```

# .roomodes

```
{
  "customModes": [
    {
      "slug": "boomerang-mode",
      "name": "Boomerang Mode",
      "roleDefinition": "You are Roo, a strategic workflow orchestrator who coordinates complex tasks by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex problems into discrete tasks that can be solved by different specialists.",
      "customInstructions": "Your role is to coordinate complex workflows by delegating tasks to specialized modes. As an orchestrator, you should:\n\n1. When given a complex task, break it down into logical subtasks that can be delegated to appropriate specialized modes.\n\n2. For each subtask, use the `new_task` tool to delegate. Choose the most appropriate mode for the subtask's specific goal and provide comprehensive instructions in the `message` parameter. These instructions must include:\n    *   All necessary context from the parent task or previous subtasks required to complete the work.\n    *   A clearly defined scope, specifying exactly what the subtask should accomplish.\n    *   An explicit statement that the subtask should *only* perform the work outlined in these instructions and not deviate.\n    *   An instruction for the subtask to signal completion by using the `attempt_completion` tool, providing a concise yet thorough summary of the outcome in the `result` parameter, keeping in mind that this summary will be the source of truth used to keep track of what was completed on this project. \n    *   A statement that these specific instructions supersede any conflicting general instructions the subtask's mode might have.\n\n3. Track and manage the progress of all subtasks. When a subtask is completed, analyze its results and determine the next steps.\n\n4. Help the user understand how the different subtasks fit together in the overall workflow. Provide clear reasoning about why you're delegating specific tasks to specific modes.\n\n5. When all subtasks are completed, synthesize the results and provide a comprehensive overview of what was accomplished.\n\n6. Ask clarifying questions when necessary to better understand how to break down complex tasks effectively.\n\n7. Suggest improvements to the workflow based on the results of completed subtasks.\n\nUse subtasks to maintain clarity. If a request significantly shifts focus or requires a different expertise (mode), consider creating a subtask rather than overloading the current one.",
      "groups": [],
      "source": "global"
    }
  ]
}
```

# .supabase/config.json

```json
{"project_id":"default","api":{"url":"http://localhost:54321","service_key":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0MzI1NTMwMCwiZXhwIjo0ODk4OTI4OTAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.7NeJ_fm9yQfzf70SmKdXb8o7bRDkY1Ge5rboMXXD04Y"},"db":{"host":"localhost","port":54322,"user":"postgres","password":"postgres","db":"postgres"}}

```

# .vscode/extensions.json

```json
{
  "recommendations": ["denoland.vscode-deno"]
}

```

# .vscode/settings.json

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "deno.enablePaths": ["supabase/functions"],
  "deno.lint": true,
  "deno.unstable": [
    "bare-node-builtins",
    "byonm",
    "sloppy-imports",
    "unsafe-proto",
    "webgpu",
    "broadcast-channel",
    "worker-options",
    "cron",
    "kv",
    "ffi",
    "fs",
    "http",
    "net"
  ],
  "docwriter.language": "English",
  "docwriter.style": "Auto-detect"
}

```

# app/auth/actions.ts

```ts
"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Sign in with magic link
export async function signIn(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get("email") as string

  // Request magic link via email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create a user if they don't exist
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Magic link sent! Check your email to sign in" }
}

// Sign up with magic link
export async function signUp(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get("email") as string

  // Send magic link for sign up
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Create a user if they don't exist
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Magic link sent! Check your email to complete signup" }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  return redirect("/")
}
// Sign in/up with OAuth provider
export async function signInWithProvider(provider: "google" | "apple") {
  const supabase = createServerClient()
  const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectURL,
    },
  })

  if (error) {
    console.error("OAuth sign-in error:", error)
    // Redirecting to sign-in page with error is tricky in server actions
    // Best handled client-side or by redirecting with a query param
    // For now, just redirecting back to sign-in might be okay,
    // but ideally, we'd show an error message.
    return redirect("/sign-in?error=OAuth sign-in failed")
  }

  if (data.url) {
    return redirect(data.url) // Redirect the user to the provider's authentication page
  }

  // Fallback redirect if no URL is returned (should not happen in normal flow)
  return redirect("/sign-in?error=Could not initiate OAuth sign-in")
}

```

# app/auth/callback/route.ts

```ts
import { createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (!code) {
      return NextResponse.redirect(
        new URL("/error?message=Missing code", requestUrl.origin)
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(
        new URL(
          `/error?message=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      new URL("/error?message=Internal server error", request.url)
    );
  }
}

```

# app/dashboard/loading.tsx

```tsx
export default function Loading() {
  return null
}


```

# app/dashboard/page.tsx

```tsx
"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// Removed unused imports: useEffect, useCallback, useRouter, PlusCircle, Search, Loader2, Button, Input, ProjectCard, listProjectsFromStorage, initializeStorage, Project, toast
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import MediathekView from "@/components/mediathek/mediathek-view";
import AnalyticsView from "@/components/analytics/analytics-view";
import ProjectsView from "@/components/dashboard/projects-view";
import ProfileView from "@/components/profile/profile-view"; // Added
import SettingsView from "@/components/settings/settings-view"; // Added
import Navbar from "@/components/layout/navbar";

export default function DashboardPage() {
  // Removed router, project state, loading state, refresh counter, toast functions, effects, and handlers
  // const router = useRouter();

  const [activeView, setActiveView] = useState<
    "projects" | "mediathek" | "analytics" | "profile" | "settings" // Added profile and settings
  >("projects");

  // Helper function to render the content based on activeView
  const renderActiveView = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />; // Use the new component
      case "mediathek":
        return <MediathekView />;
      case "analytics":
        return <AnalyticsView />;
      case "profile": // Added case
        return <ProfileView />;
      case "settings": // Added case
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView="dashboard" />
      <div className="flex flex-1">
        <DashboardSidebar
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <main className="flex-1 ml-64 pt-[73px]">
          <div className="h-full px-12 py-8">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
}

```

# app/editor/layout.tsx

```tsx
import type { ReactNode } from "react";
import { DragAndDropProvider } from "@/components/dnd-provider"; // Import the provider

export default async function EditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Allow access to the editor without authentication
  // Wrap children with the provider
  return <DragAndDropProvider>{children}</DragAndDropProvider>;
}

```

# app/editor/loading.tsx

```tsx
export default function Loading() {
  return null
}


```

# app/editor/page.tsx

```tsx
/**
 * The `EditorPage` function in this TypeScript React component handles the initialization, loading,
 * and rendering of a project editor interface, including error handling and navigation.
 * @returns The `EditorPage` component returns different content based on the state of the application:
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import LeftSidebar from "@/components/layout/left-sidebar";
import Canvas from "@/components/canvas/canvas";
// import RightSidebar from "@/components/layout/right-sidebar"; // Remove old import
// import PropertiesPanel from "@/components/layout/properties-panel"; // Remove old import
import { EditorRightSidebar } from "@/components/layout/editor-right-sidebar"; // Import using named import
import { ViewportProvider } from "@/lib/hooks/use-viewport";
import { useBlocksStore } from "@/store/blocks-store";
import { initializeStorage } from "@/lib/supabase/storage";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const router = useRouter();
  const {
    loadProject,
    currentProjectTitle,
    setProjectTitle,
    isLoading,
    createNewProject,
  } = useBlocksStore();

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manuallyCreatedProject, setManuallyCreatedProject] = useState<
    string | null
  >(null);

  // Use a ref to track if we already tried to create a project
  // This helps prevent multiple project creations during React's rendering cycles
  const hasTriedCreatingProject = useRef(false);

  // Handle the case where we successfully created a project manually
  // This effect runs after we have a manuallyCreatedProject ID
  useEffect(() => {
    if (manuallyCreatedProject && !projectId) {
      // Update URL with new project ID using window.history to avoid triggering re-renders
      // This is a workaround to avoid Next.js router behavior that might cause multiple renders
      const newUrl = `${window.location.pathname}?projectId=${manuallyCreatedProject}`;
      window.history.replaceState({ as: newUrl, url: newUrl }, "", newUrl);

      console.log(`URL updated with new project ID: ${manuallyCreatedProject}`);
    }
  }, [manuallyCreatedProject, projectId]);

  // Initialize storage and load project
  useEffect(() => {
    // Prevent this effect from running more than once
    if (!initializing || hasTriedCreatingProject.current) return;

    hasTriedCreatingProject.current = true;

    async function init() {
      try {
        // Initialize Supabase storage
        console.log("Initializing storage...");
        await initializeStorage();

        if (projectId) {
          // Load existing project
          console.log(`Loading existing project: ${projectId}`);
          const success = await loadProject(projectId);
          if (!success) {
            console.error(`Failed to load project with ID: ${projectId}`);
            setError(`Failed to load project with ID: ${projectId}`);
          } else {
            console.log(`Successfully loaded project: ${projectId}`);
          }
        } else {
          // Create a new project manually when no projectId is provided
          console.log("No project ID, creating new project...");

          const newProjectId = await createNewProject("Unbenanntes Projekt");
          if (newProjectId) {
            console.log(`Created new project: ${newProjectId}`);
            // Instead of using router.replace which may cause re-renders,
            // we'll store the ID and update the URL in a separate effect
            setManuallyCreatedProject(newProjectId);
          } else {
            console.error("Failed to create a new project");
            setError("Fehler beim Erstellen eines neuen Projekts");
          }
        }
      } catch (err) {
        console.error("Error initializing editor:", err);
        setError("Beim Initialisieren des Editors ist ein Fehler aufgetreten");
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [projectId, loadProject, createNewProject, initializing]);

  // Show loading state
  if (initializing || isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar currentView="editor" projectTitle="Loading..." />
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Projekt wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar currentView="editor" projectTitle="Error" />
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-4">
              Fehler beim Laden des Projekts
            </h2>
            <p className="mb-6">{error}</p>
            <div className="flex justify-end">
              <Button onClick={() => router.push("/dashboard")}>
                Zurück zum Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ViewportProvider>
      <div className="flex flex-col h-screen">
        <Navbar
          currentView="editor"
          projectTitle={currentProjectTitle}
          onTitleChange={setProjectTitle}
        />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <div className="flex-1 bg-muted overflow-auto flex flex-col">
            <Canvas />
          </div>
          {/* <RightSidebar /> */}
          {/* <PropertiesPanel /> */}
          <EditorRightSidebar /> {/* Use the combined sidebar */}
        </div>
      </div>
    </ViewportProvider>
  );
}

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/fonts/GeistMonoVF.woff

This is a binary file of the type: Binary

# app/fonts/GeistVF.woff

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;

    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;

    --primary: 142 76% 36%;
    --primary-foreground: 355 100% 100%;

    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;

    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;

    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142 76% 36%;

    --radius: 1rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}

/* Custom styles for bento box layout */
.bento-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.bento-box {
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.bento-box:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

.tiptap-paragraph-editor .ProseMirror {
  min-height: 250px;
  padding: 0.75rem;
}

/* Import Tiptap styles */
@import "../styles/tiptap.css";
/* Import Tippy.js styles for tooltips and popovers */
@import "tippy.js/dist/tippy.css";
@import "tippy.js/animations/shift-away.css";

/* Typewriter cursor blink animation */
@keyframes text-blink {
  0%,
  75% {
    opacity: 1;
  }
  75.1%,
  95% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-text-blink {
  animation: text-blink 1.2s infinite ease-in-out;
}

/* Add the pulse animation for the drag handle */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(29, 78, 216, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(29, 78, 216, 0);
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

```

# app/layout.tsx

```tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ViewportProvider } from "@/lib/hooks/use-viewport";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Boards",
  description: "Create beautiful boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <SupabaseProvider>
          <ViewportProvider>{children}</ViewportProvider>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}

```

# app/mediathek/page.tsx

```tsx
"use client";

import { useState } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  Link2,
  FileText,
  Search,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/navbar";
import Image from "next/image";

// Typen für die Mediendateien
type MediaType = "image" | "video" | "audio" | "link" | "document";

interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  thumbnail?: string;
  createdAt: Date;
}

// Dummy-Daten für die Demonstration
const dummyMedia: MediaItem[] = [
  // Bilder
  {
    id: "img1",
    type: "image",
    title: "Beispielbild 1",
    url: "/images/example1.jpg",
    thumbnail: "/images/example1-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img2",
    type: "image",
    title: "Beispielbild 2",
    url: "/images/example2.jpg",
    thumbnail: "/images/example2-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img3",
    type: "image",
    title: "Beispielbild 3",
    url: "/images/example3.jpg",
    thumbnail: "/images/example3-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img4",
    type: "image",
    title: "Beispielbild 4",
    url: "/images/example4.jpg",
    thumbnail: "/images/example4-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "img5",
    type: "image",
    title: "Beispielbild 5",
    url: "/images/example5.jpg",
    thumbnail: "/images/example5-thumb.jpg",
    createdAt: new Date(),
  },
  // Videos
  {
    id: "vid1",
    type: "video",
    title: "Beispielvideo 1",
    url: "/videos/example1.mp4",
    thumbnail: "/videos/example1-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid2",
    type: "video",
    title: "Beispielvideo 2",
    url: "/videos/example2.mp4",
    thumbnail: "/videos/example2-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid3",
    type: "video",
    title: "Beispielvideo 3",
    url: "/videos/example3.mp4",
    thumbnail: "/videos/example3-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid4",
    type: "video",
    title: "Beispielvideo 4",
    url: "/videos/example4.mp4",
    thumbnail: "/videos/example4-thumb.jpg",
    createdAt: new Date(),
  },
  {
    id: "vid5",
    type: "video",
    title: "Beispielvideo 5",
    url: "/videos/example5.mp4",
    thumbnail: "/videos/example5-thumb.jpg",
    createdAt: new Date(),
  },
  // Audio
  {
    id: "aud1",
    type: "audio",
    title: "Beispielaudio 1",
    url: "/audio/example1.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud2",
    type: "audio",
    title: "Beispielaudio 2",
    url: "/audio/example2.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud3",
    type: "audio",
    title: "Beispielaudio 3",
    url: "/audio/example3.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud4",
    type: "audio",
    title: "Beispielaudio 4",
    url: "/audio/example4.mp3",
    createdAt: new Date(),
  },
  {
    id: "aud5",
    type: "audio",
    title: "Beispielaudio 5",
    url: "/audio/example5.mp3",
    createdAt: new Date(),
  },
  // Links
  {
    id: "link1",
    type: "link",
    title: "Beispiellink 1",
    url: "https://example1.com",
    createdAt: new Date(),
  },
  {
    id: "link2",
    type: "link",
    title: "Beispiellink 2",
    url: "https://example2.com",
    createdAt: new Date(),
  },
  {
    id: "link3",
    type: "link",
    title: "Beispiellink 3",
    url: "https://example3.com",
    createdAt: new Date(),
  },
  {
    id: "link4",
    type: "link",
    title: "Beispiellink 4",
    url: "https://example4.com",
    createdAt: new Date(),
  },
  {
    id: "link5",
    type: "link",
    title: "Beispiellink 5",
    url: "https://example5.com",
    createdAt: new Date(),
  },
  // Dokumente
  {
    id: "doc1",
    type: "document",
    title: "Beispieldokument 1",
    url: "/documents/example1.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc2",
    type: "document",
    title: "Beispieldokument 2",
    url: "/documents/example2.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc3",
    type: "document",
    title: "Beispieldokument 3",
    url: "/documents/example3.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc4",
    type: "document",
    title: "Beispieldokument 4",
    url: "/documents/example4.pdf",
    createdAt: new Date(),
  },
  {
    id: "doc5",
    type: "document",
    title: "Beispieldokument 5",
    url: "/documents/example5.pdf",
    createdAt: new Date(),
  },
];

export default function MediathekPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filter Medien basierend auf der Suchanfrage
  const filteredMedia = dummyMedia.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gruppiere Medien nach Typ
  const groupedMedia = filteredMedia.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<MediaType, MediaItem[]>);

  // Render-Funktion für die Medienvorschau
  const renderMediaPreview = (item: MediaItem) => {
    switch (item.type) {
      case "image":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={`Vorschaubild für ${item.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <LucideImage className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={`Vorschaubild für ${item.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "link":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render-Funktion für eine Medienkategorie
  const renderMediaCategory = (
    type: MediaType,
    title: string,
    icon: React.ReactNode
  ) => {
    const items = groupedMedia[type] || [];
    const displayItems = items.slice(0, 4);
    const hasMore = items.length > 4;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="relative">
              {renderMediaPreview(item)}
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              mehr
            </Button>
          )}
        </div>
      </section>
    );
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload here
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView="mediathek" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mediathek</h1>
          <div className="relative w-full max-w-md ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Medien durchsuchen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Linke Spalte: Medienkategorien */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {renderMediaCategory(
                  "image",
                  "Bilder",
                  <LucideImage className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "video",
                  "Videos",
                  <Video className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "audio",
                  "Audio",
                  <Music className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "link",
                  "Links",
                  <Link2 className="h-5 w-5" />
                )}
                {renderMediaCategory(
                  "document",
                  "Dokumente",
                  <FileText className="h-5 w-5" />
                )}
              </div>
            )}
          </div>

          {/* Rechte Spalte: Upload-Bereich */}
          <div className="w-80">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Medien hochladen</h2>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  transition-colors duration-200
                  ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Dateien hierher ziehen oder
                  </p>
                  <Button variant="link" className="mt-1">
                    Dateien auswählen
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximale Dateigröße: 50MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# app/page.tsx

```tsx
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <div className="min-h-screen">
          <Hero />
        </div>
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

```

# app/sign-in/page.tsx

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (loginError) {
        setError(loginError.message);
      } else {
        setSuccess(
          "Magic Link wurde gesendet! Bitte überprüfen Sie Ihre E-Mails."
        );
        setEmail("");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (googleError) setError(googleError.message);
    } catch (error) {
      console.error("Google login error:", error);
      setError("Ein Fehler ist beim Login mit Google aufgetreten");
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { error: appleError } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (appleError) setError(appleError.message);
    } catch (error) {
      console.error("Apple login error:", error);
      setError("Ein Fehler ist beim Login mit Apple aufgetreten");
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with illustration */}
      <div
        className="flex flex-1 items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-min.jpg')" }}
      ></div>

      {/* Right side with form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Anmelden</h1>
            <p className="text-gray-600">Willkommen zurück!</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Mit Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAppleLogin}
              disabled={isLoading}
            >
              <FaApple size={20} />
              Mit Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">
                oder mit E-Mail
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Noch kein Konto?{" "}
            <Link href="/sign-up" className="font-medium underline">
              Hier registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# app/sign-up/page.tsx

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(
          "Magic Link wurde gesendet! Bitte überprüfen Sie Ihre E-Mails zur Bestätigung der Registrierung."
        );
        setEmail("");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (googleError) setError(googleError.message);
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Ein Fehler ist bei der Registrierung mit Google aufgetreten");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const { error: appleError } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (appleError) setError(appleError.message);
    } catch (error) {
      console.error("Apple signup error:", error);
      setError("Ein Fehler ist bei der Registrierung mit Apple aufgetreten");
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with illustration */}
      <div
        className="flex flex-1 items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-min.jpg')" }}
      ></div>

      {/* Right side with form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Registrieren</h1>
            <p className="text-gray-600">
              Erstellen Sie ein Konto und starten Sie noch heute
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Mit Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAppleSignUp}
              disabled={isLoading}
            >
              <FaApple size={20} />
              Mit Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">
                oder mit E-Mail
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                "Registrieren"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Bereits ein Konto?{" "}
            <Link href="/sign-in" className="font-medium underline">
              Hier anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# CLAUDE.md

```md
# CLAUDE.md - Guidelines for Boards Klon

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style
- **TypeScript**: Strict type checking, explicit return types for functions
- **Imports**: Group imports by type (React, libraries, internal), sort alphabetically
- **Components**: Use functional components with explicit type definitions
- **Naming**: PascalCase for components, camelCase for variables/functions
- **State Management**: Zustand for global state, React hooks for local state
- **Error Handling**: Use try/catch for async operations, provide meaningful error messages
- **Formatting**: Use 2-space indentation, max 80 characters per line
- **Path Aliases**: Use `@/` for imports from project root
- **UI Components**: Use shadcn/ui component patterns with Tailwind CSS

## Project Structure
- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and types
- `/store` - Zustand state management
- `/utils` - Helper functions and utilities

## Authentication Flow
- **Protected Routes**: `/dashboard` and `/editor` require authentication
- **Sign Up**: Magic link authentication (passwordless)
  - User enters email → Magic link sent → User clicks link → Account created
- **Sign In**: Magic link authentication (passwordless)
  - User enters email → Magic link sent → User clicks link → Authentication complete
- **Server-side Protection**: Middleware checks auth status and redirects as needed
```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

# components/analytics/analytics-view.tsx

```tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react"; // Example icons

export default function AnalyticsView() {
  // Mock data for demonstration
  const mockStats = [
    { title: "Besucher", value: "1,234", change: "+5.2%", icon: BarChart },
    {
      title: "Projektaufrufe",
      value: "8,765",
      change: "+12.1%",
      icon: LineChart,
    },
    {
      title: "Medien-Downloads",
      value: "456",
      change: "-1.5%",
      icon: PieChart,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {mockStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} zum Vormonat
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center text-muted-foreground">
        <p>(Weitere Analytics-Daten und Diagramme werden hier angezeigt)</p>
      </div>
    </div>
  );
}

```

# components/auth/auth-form.tsx

```tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";

export default function AuthForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  // Use a client-side only state with useEffect to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Set mounted to true after component mounts to enable client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication client not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/editor");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication client not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Anmelden</TabsTrigger>
          <TabsTrigger value="signup">Registrieren</TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !supabase || !mounted}
            >
              {/* Only show loading state if component is mounted (client-side) */}
              {mounted && isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !supabase || !mounted}
            >
              {/* Only show loading state if component is mounted (client-side) */}
              {mounted && isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

# components/auth/user-auth-button.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";

export function UserAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading || !supabase}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  );
}

```

# components/blocks/audio-block.tsx

```tsx
"use client";

import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

interface AudioBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the audio file
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AudioBlock({
  blockId,
  dropAreaId,
  content,
  isSelected,
  onSelect,
}: AudioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "audio",
      content,
      sourceDropAreaId: dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  // Extract filename from URL if not provided, then sanitize it
  const rawFileName = content.split("/").pop() || "Audio File";
  const displayFileName = sanitizeFilename(rawFileName);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load audio");
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      {isLoading && (
        <div className="flex h-24 items-center justify-center bg-gray-100">
          <Music className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      )}

      {error && (
        <div className="flex h-24 items-center justify-center bg-red-50 text-red-500">
          <Music className="mr-2 h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      <div className={cn("space-y-2", (isLoading || error) && "hidden")}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayPause}
            className="rounded-full bg-gray-100 p-3 text-gray-900 hover:bg-gray-200"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Display the sanitized filename */}
        <p
          className="mt-2 text-center text-sm text-gray-600 truncate"
          title={displayFileName}
        >
          {displayFileName}
        </p>

        <audio
          ref={audioRef}
          src={content}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
}

```

# components/blocks/canvas-block.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react"; // Import useState
import { useBlocksStore } from "@/store/blocks-store";
import type { BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { Trash2, Move } from "@/lib/icons"; // Removed Split import
import { useBlockDrag } from "@/lib/hooks/use-block-drag";
import { ParagraphBlock } from "./paragraph-block";
import { ImageBlock } from "./image-block"; // Import the new component
import { VideoBlock } from "./video-block";
import { AudioBlock } from "./audio-block";
import { DocumentBlock } from "./document-block";
import React from "react";

interface CanvasBlockProps {
  block: BlockType;
  viewport?: ViewportType;
  index: number; // Add index prop
  // Removed onSplit, canSplit props
  isOnlyBlockInArea?: boolean;
}

export function CanvasBlock({
  block,
  index, // Destructure index
  viewport = "desktop",
  // Removed onSplit, canSplit props
  isOnlyBlockInArea = false,
}: CanvasBlockProps) {
  const { selectedBlockId, selectBlock, deleteBlock } = useBlocksStore();
  const isSelected = selectedBlockId === block.id;
  // Pass index to useBlockDrag
  // Use the drag hook directly - our tracking system will prevent duplicate drags
  const { isDragging, drag } = useBlockDrag(block, index);
  const [isHovering, setIsHovering] = useState(false); // Add hover state

  // Clear selection when dragging starts
  useEffect(() => {
    if (isDragging && isSelected) {
      selectBlock(null);
    }
  }, [isDragging, isSelected, selectBlock]);

  const handleBlockClick = () => {
    if (!isSelected) {
      selectBlock(block.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id, block.dropAreaId);
    selectBlock(null);
  };

  return (
    <div>
      {/* Main styled container - already has position: relative */}
      <div
        className={`p-4 bg-background border rounded-lg shadow-sm relative group
        ${
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }
        ${viewport === "mobile" ? "text-sm" : ""}
        ${isDragging ? "opacity-60" : "opacity-100"}
        transition-all duration-200 hover:shadow-md
      `}
        onClick={handleBlockClick}
        onMouseEnter={() => setIsHovering(true)} // Add mouse enter handler
        onMouseLeave={() => setIsHovering(false)} // Add mouse leave handler
        data-id={block.id}
        data-drop-area-id={block.dropAreaId}
      >
        {/* Conditionally render controls based on hover or selection */}
        {(isHovering || isSelected) && (
          <BlockControls
            onDelete={handleDelete}
            // Removed onSplit and canSplit props
            isDragging={isDragging}
            drag={drag as any} // Pass drag ref down
            showDeleteButton={!isOnlyBlockInArea}
          />
        )}
        <div>
          <BlockContent block={block} viewport={viewport} />
        </div>
      </div>
    </div>
  );
}

// Extracted component for block controls
function BlockControls({
  onDelete,
  // Removed onSplit, canSplit
  isDragging,
  drag, // Destructure the passed drag ref
  showDeleteButton = true, // New prop with default value
}: {
  onDelete: (e: React.MouseEvent) => void;
  // Removed onSplit, canSplit types
  isDragging: boolean;
  drag: React.Ref<HTMLButtonElement>;
  showDeleteButton?: boolean; // Add to type definition
}) {
  // Don't show controls while dragging
  if (isDragging) return null;

  return (
    <>
      {/* Delete button - show if allowed */}
      {showDeleteButton && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md
                  hover:bg-red-600 transition-colors duration-200 z-10" // Removed opacity/group-hover
          onClick={onDelete}
          title="Block löschen"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Move handle */}
      <button
        ref={drag}
        className="absolute -top-2 -left-2 bg-primary text-primary-foreground p-2 rounded-full
                  shadow-md hover:bg-primary/90 cursor-grab active:cursor-grabbing
                  ring-4 ring-background pulse-animation transition-colors z-20" // Removed opacity/group-hover
        title="Zum Verschieben ziehen"
        onClick={(e) => e.stopPropagation()} // Keep stopPropagation here
      >
        <Move size={16} />
      </button>
    </>
  );
}

// Extracted component for block content
interface BlockContentProps {
  block: BlockType;
  viewport: ViewportType;
}

function BlockContent({ block, viewport }: BlockContentProps) {
  const { updateBlockContent } = useBlocksStore();

  const handleHeadingChange = (data: { level: number; content: string }) => {
    // Ensure the level is valid before updating
    const validLevels = [1, 2, 3, 4, 5, 6] as const;
    type ValidHeadingLevel = (typeof validLevels)[number];
    const validatedLevel = validLevels.includes(data.level as ValidHeadingLevel)
      ? (data.level as ValidHeadingLevel)
      : 1;

    // Update block content and heading level
    updateBlockContent(block.id, block.dropAreaId, data.content, {
      headingLevel: validatedLevel,
    });
  };

  // Render different block types
  if (block.type === "heading") {
    // Import the HeadingBlock dynamically (to avoid circular dependencies)
    // Using dynamic import with React.lazy would be better, but for simplicity we'll handle it this way
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HeadingBlock } = require("@/components/blocks/heading-block");

    // Validate heading level before passing to component
    const validLevels = [1, 2, 3, 4, 5, 6] as const;
    type ValidHeadingLevel = (typeof validLevels)[number];
    const headingLevel = block.headingLevel;
    const validatedLevel: ValidHeadingLevel =
      headingLevel && validLevels.includes(headingLevel as ValidHeadingLevel)
        ? (headingLevel as ValidHeadingLevel)
        : 1; // Default to 1 if undefined or invalid

    return (
      <HeadingBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        level={validatedLevel}
        content={block.content}
        onChange={handleHeadingChange}
      />
    );
  }

  if (block.type === "image") {
    return (
      <ImageBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
        altText={block.altText}
      />
    );
  }

  if (block.type === "video") {
    return (
      <VideoBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
      />
    );
  }

  if (block.type === "audio") {
    return (
      <AudioBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
      />
    );
  }

  if (block.type === "document") {
    return (
      <DocumentBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
        fileName={block.fileName}
      />
    );
  }

  if (block.type === "paragraph") {
    return (
      <ParagraphBlock
        blockId={block.id}
        dropAreaId={block.dropAreaId}
        content={block.content}
        viewport={viewport}
      />
    );
  }

  // Default fallback
  return (
    <div className="p-4 bg-red-50 text-red-500 rounded">
      Unknown block type: {block.type}
    </div>
  );
}

```

# components/blocks/document-block.tsx

```tsx
"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

interface DocumentBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the document
  fileName?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function DocumentBlock({
  blockId,
  dropAreaId,
  content,
  fileName,
  isSelected,
  onSelect,
}: DocumentBlockProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "document",
      content,
      sourceDropAreaId: dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  // Extract filename from URL if not provided, then sanitize it
  const rawDisplayName = fileName || content.split("/").pop() || "Document";
  const displayName = sanitizeFilename(rawDisplayName);

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <FileText className="h-8 w-8 flex-shrink-0 text-gray-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-gray-500">Click to open</p>
        </div>
        <ExternalLink className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  );
}

```

# components/blocks/draggable-block.tsx

```tsx
"use client";

import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import type { LucideIcon } from "lucide-react";

interface DraggableBlockProps {
  type: string;
  content: string | null;
  icon: LucideIcon;
  description: string;
}

export function DraggableBlock({
  type,
  content,
  icon: Icon,
  description,
}: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: {
      type,
      content,
      isSidebarItem: true,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`aspect-square flex flex-col items-center justify-center p-3 bg-background border border-border
                rounded-lg cursor-move shadow-sm hover:shadow-md transition-all
                ${
                  isDragging
                    ? "opacity-50 scale-95 border-primary"
                    : "opacity-100 scale-100"
                }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

```

# components/blocks/heading-block.tsx

```tsx
"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useBlocksStore } from "@/store/blocks-store";
import { useEditorStore } from "@/store/editor-store";
import EmojiExtension, {
  EmojiPickerButton,
} from "@/lib/extensions/emoji-extension";
import type { Level } from "@tiptap/extension-heading";
import { HexColorPicker } from "react-colorful";
import "tippy.js/dist/tippy.css";

interface HeadingBlockProps {
  blockId: string;
  dropAreaId: string;
  level?: Level;
  content: string;
  onChange: (data: { level: Level; content: string }) => void;
  readOnly?: boolean;
}

// Color picker component
const ColorPicker = ({ editor }: { editor: Editor }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [color, setColor] = React.useState(
    () => editor?.getAttributes("textStyle").color || "#000000"
  );
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle clicks outside the color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (editor) {
      editor.chain().focus().setColor(newColor).run();
    }
  };

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={togglePicker}
        onMouseDown={(e) => e.preventDefault()}
        className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center gap-2"
        aria-label="Text color"
        aria-expanded={isOpen}
      >
        <span
          className="w-4 h-4 border border-gray-300 rounded"
          style={{
            backgroundColor: color,
          }}
        />
        <span>Farbe</span>
      </button>
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HexColorPicker color={color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

// Toolbar component for the heading block
const HeadingToolbar = ({ editor }: { editor: Editor }) => {
  const { updateActiveFormats } = useEditorStore();

  // Update active formats when editor state changes
  useEffect(() => {
    const updateFormats = () => {
      updateActiveFormats({
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        heading4: editor.isActive("heading", { level: 4 }),
        heading5: editor.isActive("heading", { level: 5 }),
        heading6: editor.isActive("heading", { level: 6 }),
      });
    };

    editor.on("transaction", updateFormats);
    return () => {
      editor.off("transaction", updateFormats);
    };
  }, [editor, updateActiveFormats]);

  const headingLevels: Level[] = [1, 2, 3, 4, 5, 6];

  return (
    <div
      className="flex flex-wrap gap-1 mb-2 bg-white/50 z-10"
      role="toolbar"
      aria-label="Heading formatting"
    >
      {headingLevels.map((level) => (
        <button
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
            editor.isActive("heading", { level }) ? "bg-gray-300" : ""
          }`}
          aria-label={`Heading ${level}`}
          aria-pressed={editor.isActive("heading", { level })}
        >
          H{level}
        </button>
      ))}
      <ColorPicker editor={editor} />
      <EmojiPickerButton editor={editor} />
    </div>
  );
};

export function HeadingBlock({
  blockId,
  dropAreaId,
  level = 1,
  content,
  onChange,
  readOnly = false,
}: HeadingBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const { setFocus, resetFormats } = useEditorStore();
  const editorRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextStyle,
      Color,
      EmojiExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // console.log("Tiptap Output:", html); // <-- REMOVED LOG
      updateBlockContent(blockId, dropAreaId, html);
      // Call the onChange prop with the current heading level
      const currentLevel =
        ([1, 2, 3, 4, 5, 6] as Level[]).find((l) =>
          editor.isActive("heading", { level: l })
        ) || level;
      onChange({ level: currentLevel, content: html });
    },
    onFocus: () => {
      setFocus(true);
    },
    onBlur: () => {
      setFocus(false);
      resetFormats();
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handleDOMEvents: {
        mousedown: (view) => {
          // Enable text selection on first click
          view.dom.style.cursor = "text";
          return false;
        },
        keydown: (_, event) => {
          // Prevent Enter key from creating new lines
          if (event.key === "Enter") {
            event.preventDefault();
            return true;
          }
          return false;
        },
        // Removed commented-out dragstart handler
      },
    },
  });

  // Set initial heading level
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().setHeading({ level }).run();
    }
  }, [editor, level]);

  return (
    <div className="h-full flex flex-col relative">
      {!readOnly && editor && <HeadingToolbar editor={editor} />}
      {editor && !readOnly ? (
        <EditorContent
          ref={editorRef}
          editor={editor}
          className="h-fit overflow-hidden border border-gray-300 rounded p-2 mt-2 tiptap-heading-editor"
        />
      ) : (
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}

```

# components/blocks/image-block.tsx

```tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { useDrop } from "react-dnd";
import type { DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Loader2, AlertCircle, UploadCloud, X } from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { cn } from "@/lib/utils";
import { ItemTypes } from "@/lib/item-types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";

// --- NEU: Hilfsfunktion zum Bereinigen von Dateinamen (kopiert aus storage.ts) ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

// Special value to indicate an empty image block
const EMPTY_IMAGE_BLOCK = "__EMPTY_IMAGE_BLOCK__";

// Interface for media items from the library
interface MediaLibraryImageItem {
  type: typeof ItemTypes.MEDIA_IMAGE;
  url: string;
  alt?: string;
  file_type: string;
}

// Update uploadImageToStorage to use session
async function uploadImageToStorage(
  file: File,
  supabaseClient: SupabaseClient,
  userId: string
): Promise<string> {
  console.log(`Uploading file: ${file.name}`);
  if (!supabaseClient) throw new Error("Supabase client not available");

  // --- MODIFIZIERT: Dateinamen bereinigen ---
  const sanitizedFileName = sanitizeFilename(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`; // Bereinigten Namen verwenden

  console.log(`Sanitized path for upload: ${filePath}`); // Logging hinzugefügt

  try {
    // Upload file to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabaseClient.storage
      .from("images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not get public URL after upload.");
    }

    console.log(`Upload successful. URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error("Error during image upload process:", error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}

// Helper function to get file dimensions (for images)
const getImageDimensions = async (
  file: File
): Promise<{ width: number; height: number }> => {
  if (!file.type.startsWith("image/")) {
    return { width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Helper function to add item to media library
const addToMediaLibrary = async (
  file: File,
  url: string,
  dimensions: { width: number; height: number },
  supabaseClient: SupabaseClient
) => {
  if (!supabaseClient) throw new Error("Supabase client not available");

  const { data: userData } = await supabaseClient.auth.getUser();
  if (!userData?.user) throw new Error("User not authenticated");

  // Add to media_items table
  const { error: dbError } = await supabaseClient.from("media_items").insert({
    id: uuidv4(),
    file_name: file.name,
    file_type: file.type,
    url: url,
    size: file.size,
    width: dimensions.width,
    height: dimensions.height,
    user_id: userData.user.id,
    uploaded_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error("Error adding to media library:", dbError);
    throw dbError;
  }
};

interface ImageBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string | null; // Image URL or null/empty for placeholder
  altText?: string;
}

// Define accepted drop item types
interface FileDropItem {
  files: File[];
}

type AcceptedDropItem = FileDropItem | MediaLibraryImageItem;

// Definiere Upload-Status-Typen für besseres State Management
type UploadStatus = "idle" | "uploading" | "loading" | "error" | "success";

interface ImageBlockState {
  status: UploadStatus;
  error: string | null;
  imageUrl: string | null;
}

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ blockId, dropAreaId, content, altText }, ref) => {
    const { updateBlockContent } = useBlocksStore();
    // Initialize with idle state if content is empty or EMPTY_IMAGE_BLOCK
    const [state, setState] = useState<ImageBlockState>(() => {
      const isEmptyOrPlaceholder = !content || content === EMPTY_IMAGE_BLOCK;
      return {
        status: isEmptyOrPlaceholder ? "idle" : "loading",
        error: null,
        imageUrl: isEmptyOrPlaceholder ? null : content,
      };
    });
    const { supabase: supabaseClient, session, user } = useSupabase();
    const router = useRouter();

    // Session-Check mit verbesserter Fehlerbehandlung
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      if (!session && state.status !== "loading") {
        timeoutId = setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [session, state.status, router]);

    // Update state when content changes
    useEffect(() => {
      const isEmptyOrPlaceholder = !content || content === EMPTY_IMAGE_BLOCK;
      setState((prev) => ({
        ...prev,
        status: isEmptyOrPlaceholder ? "idle" : "loading",
        imageUrl: isEmptyOrPlaceholder ? null : content,
        error: null,
      }));
    }, [content]);

    // Cleanup bei Unmount
    useEffect(() => {
      return () => {
        setState({
          status: "idle",
          error: null,
          imageUrl: null,
        });
      };
    }, []);

    // Verbesserte Bildverarbeitung
    const processDroppedFiles = useCallback(
      async (files: File[]) => {
        const imageFile = files.find((file) => file.type.startsWith("image/"));
        if (!imageFile) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "Nur Bilddateien werden akzeptiert",
          }));
          toast.error("Nur Bilddateien werden akzeptiert");
          return;
        }

        if (!session || !user || !supabaseClient) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "Bitte melden Sie sich an",
          }));
          toast.error("Bitte melden Sie sich an");
          router.push("/auth/login");
          return;
        }

        setState((prev) => ({ ...prev, status: "uploading", error: null }));

        try {
          // Get image dimensions before upload
          const dimensions = await getImageDimensions(imageFile);

          // Upload the file
          const uploadedUrl = await uploadImageToStorage(
            imageFile,
            supabaseClient,
            user.id
          );

          // Add to media library
          await addToMediaLibrary(
            imageFile,
            uploadedUrl,
            dimensions,
            supabaseClient
          );

          // Update block content
          updateBlockContent(blockId, dropAreaId, uploadedUrl, {
            altText: altText || imageFile.name,
          });

          setState((prev) => ({
            ...prev,
            status: "success",
            imageUrl: uploadedUrl,
            error: null,
          }));

          toast.success(`${imageFile.name} erfolgreich hochgeladen`);
        } catch (error) {
          console.error("Upload fehlgeschlagen:", error);
          const message =
            error instanceof Error ? error.message : "Unbekannter Fehler";

          setState((prev) => ({
            ...prev,
            status: "error",
            error: `Upload fehlgeschlagen: ${message}`,
          }));

          toast.error(message);
        }
      },
      [
        blockId,
        dropAreaId,
        updateBlockContent,
        altText,
        session,
        user,
        supabaseClient,
        router,
      ]
    );

    const [{ isOver, canDrop }, dropRef] = useDrop<
      AcceptedDropItem,
      void,
      { isOver: boolean; canDrop: boolean }
    >(
      () => ({
        accept: [NativeTypes.FILE, ItemTypes.MEDIA_IMAGE],
        drop: (
          item: AcceptedDropItem,
          monitor: DropTargetMonitor<AcceptedDropItem>
        ) => {
          const itemType = monitor.getItemType();
          if (itemType === NativeTypes.FILE) {
            const fileItem = item as FileDropItem;
            if (fileItem.files) {
              processDroppedFiles(fileItem.files);
            }
          } else if (itemType === ItemTypes.MEDIA_IMAGE) {
            const mediaItem = item as MediaLibraryImageItem;
            if (mediaItem.url && mediaItem.file_type.startsWith("image/")) {
              updateBlockContent(blockId, dropAreaId, mediaItem.url, {
                altText: mediaItem.alt || altText || "",
              });
            }
          }
        },
        canDrop: (
          item: AcceptedDropItem,
          monitor: DropTargetMonitor<AcceptedDropItem>
        ) => {
          const itemType = monitor.getItemType();
          if (itemType === NativeTypes.FILE) {
            const fileItem = item as FileDropItem;
            return (
              fileItem.files?.some((file) => file.type.startsWith("image/")) ??
              false
            );
          }
          if (itemType === ItemTypes.MEDIA_IMAGE) {
            const mediaItem = item as MediaLibraryImageItem;
            return mediaItem.file_type.startsWith("image/");
          }
          return false;
        },
        collect: (monitor: DropTargetMonitor<AcceptedDropItem>) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      }),
      [blockId, dropAreaId, processDroppedFiles, updateBlockContent, altText]
    );

    const isActive = isOver && canDrop;

    // Combine the forwarded ref and the drop ref
    const combinedRef = (node: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      (dropRef as (node: HTMLDivElement | null) => void)(node);
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          "relative w-full border border-dashed border-transparent transition-colors duration-200",
          (!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
            "aspect-video",
          isActive
            ? "border-primary bg-primary/10"
            : canDrop
            ? "border-primary/50"
            : "border-transparent",
          (!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
            "bg-muted rounded-lg",
          canDrop && "hover:border-primary hover:border-2"
        )}
      >
        {canDrop && (
          <div
            className={cn(
              "absolute inset-0 z-30 transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-primary">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <UploadCloud className="h-10 w-10 mb-2 text-primary" />
                <p className="text-sm font-medium text-primary">
                  Neues Bild hier ablegen
                </p>
              </div>
            </div>
          </div>
        )}

        {state.imageUrl &&
          state.imageUrl !== EMPTY_IMAGE_BLOCK &&
          state.status !== "uploading" &&
          state.status !== "loading" && (
            <button
              onClick={() => {
                updateBlockContent(blockId, dropAreaId, EMPTY_IMAGE_BLOCK, {
                  altText: "",
                });
                setState((prev) => ({
                  ...prev,
                  status: "idle",
                  imageUrl: null,
                  error: null,
                }));
              }}
              className="absolute top-2 right-2 z-40 p-1 bg-background/80 hover:bg-background rounded-full shadow-sm"
              aria-label="Bild löschen"
            >
              <X className="h-4 w-4" />
            </button>
          )}

        {(!state.imageUrl || state.imageUrl === EMPTY_IMAGE_BLOCK) &&
          state.status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
              <UploadCloud
                className={cn(
                  "h-10 w-10 mb-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )}
              />
              <p className="text-sm font-medium">
                Bild hierher ziehen oder{" "}
                <span className="text-primary">hochladen</span>
              </p>
              <p className="text-xs mt-1">Oder URL im Seitenmenü eingeben</p>
            </div>
          )}

        {(state.status === "uploading" || state.status === "loading") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/80 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">
              {state.status === "uploading"
                ? "Wird hochgeladen..."
                : "Wird geladen..."}
            </p>
          </div>
        )}

        <div className="relative w-full aspect-video">
          {state.status === "loading" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {state.error &&
            state.status === "error" &&
            state.imageUrl &&
            state.imageUrl !== EMPTY_IMAGE_BLOCK && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-destructive/10 rounded-lg p-4 text-destructive">
                <AlertCircle className="h-6 w-6 mb-1" />
                <p className="text-xs text-center">{state.error}</p>
              </div>
            )}

          {state.imageUrl &&
            state.imageUrl !== EMPTY_IMAGE_BLOCK &&
            typeof state.imageUrl === "string" &&
            state.imageUrl.trim().startsWith("http") && (
              <div className="relative w-full h-full">
                <Image
                  src={state.imageUrl}
                  alt={altText || "Bild"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover rounded-lg",
                    (state.status === "loading" || state.status === "error") &&
                      "opacity-0",
                    isActive && "opacity-50 transition-opacity duration-200"
                  )}
                  onLoad={() =>
                    setState((prev) => ({
                      ...prev,
                      status: "success",
                      error: null,
                    }))
                  }
                  onError={() =>
                    setState((prev) => ({
                      ...prev,
                      status: "error",
                      error: "Bild konnte nicht geladen werden",
                    }))
                  }
                  priority={false}
                  quality={85}
                />
              </div>
            )}
        </div>
      </div>
    );
  }
);

// Add display name
ImageBlock.displayName = "ImageBlock";

```

# components/blocks/paragraph-block.tsx

```tsx
"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useBlocksStore } from "@/store/blocks-store";
import { useEditorStore } from "@/store/editor-store";
import EmojiExtension, {
  EmojiPickerButton,
} from "@/lib/extensions/emoji-extension";
import "tippy.js/dist/tippy.css";

interface ParagraphBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string;
  viewport?: "mobile" | "tablet" | "desktop";
  readOnly?: boolean; // Add readOnly prop
}

const TiptapToolbar = ({ editor }: { editor: Editor }) => {
  const { activeFormats, updateActiveFormats } = useEditorStore();

  // Update active formats when editor state changes
  useEffect(() => {
    const updateFormats = () => {
      updateActiveFormats({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
      });
    };

    editor.on("transaction", updateFormats);
    return () => {
      editor.off("transaction", updateFormats);
    };
  }, [editor, updateActiveFormats]);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL eingeben:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Add https:// if no protocol is specified
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;

    editor.chain().focus().toggleLink({ href: urlWithProtocol }).run();
  };

  return (
    <div
      className="flex flex-wrap gap-1 mb-2 bg-white/50 z-10"
      role="toolbar"
      aria-label="Text formatting"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.bold ? "bg-gray-300" : ""
        }`}
        aria-label="Bold"
        aria-pressed={activeFormats.bold}
      >
        Fett
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.italic ? "bg-gray-300" : ""
        }`}
        aria-label="Italic"
        aria-pressed={activeFormats.italic}
      >
        Kursiv
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.underline ? "bg-gray-300" : ""
        }`}
        aria-label="Underline"
        aria-pressed={activeFormats.underline}
      >
        Unterstrichen
      </button>
      <button
        onClick={setLink}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.link ? "bg-gray-300" : ""
        }`}
        aria-label="Link"
        aria-pressed={activeFormats.link}
      >
        Link
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.bulletList ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.orderedList}
        aria-label="Bullet List"
        aria-pressed={activeFormats.bulletList}
      >
        Aufzählung
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.orderedList ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.bulletList}
        aria-label="Numbered List"
        aria-pressed={activeFormats.orderedList}
      >
        Nummerierung
      </button>
      <button
        onClick={() => {
          editor.chain().focus().toggleBlockquote().run();
          // Ensure blockquote has a paragraph inside
          if (editor.isActive("blockquote")) {
            const { state } = editor;
            const { selection } = state;
            const node = selection.$anchor.node();
            if (node.type.name === "blockquote" && node.childCount === 0) {
              editor.chain().focus().insertContent("<p></p>").run();
            }
          }
        }}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.blockquote ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.blockquote}
        aria-label="Blockquote"
        aria-pressed={activeFormats.blockquote}
      >
        Zitat
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
        aria-label="Horizontal Rule"
      >
        Trennlinie
      </button>
      <EmojiPickerButton editor={editor} />
    </div>
  );
};

export function ParagraphBlock({
  blockId,
  dropAreaId,
  content,
  viewport = "desktop",
  readOnly = false, // Destructure readOnly prop
}: ParagraphBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const { setFocus, resetFormats } = useEditorStore();

  const textSizeClass =
    viewport === "mobile"
      ? "text-base"
      : viewport === "tablet"
      ? "text-lg"
      : "text-xl";

  const editor = useEditor({
    editable: !readOnly, // Control editability based on readOnly prop
    immediatelyRender: false, // Add this line to prevent SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        blockquote: {
          HTMLAttributes: {
            class: "blockquote",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      EmojiExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Only update if not readOnly
      if (!readOnly) {
        const html = editor.getHTML();
        updateBlockContent(blockId, dropAreaId, html);
      }
    },
    onFocus: () => {
      // Only handle focus if not readOnly
      if (!readOnly) {
        setFocus(true);
      }
    },
    onBlur: () => {
      // Only handle blur if not readOnly
      if (!readOnly) {
        setFocus(false);
        resetFormats();
      }
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${readOnly ? "cursor-default" : ""}`, // Add cursor style for readOnly
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          // Prevent interaction if readOnly
          if (readOnly) {
            event.preventDefault();
            return true;
          }
          // Enable text selection on first click
          view.dom.style.cursor = "text";
          return false;
        },
        // --- Reverted drag event handlers ---
        // dragover: ... (removed)
        // drop: ... (removed)
        // --- End reverted drag event handlers ---
      },
      handleKeyDown: (view, event) => {
        // Prevent all keydown events if readOnly
        if (readOnly) {
          return true;
        }
        // Ctrl/Cmd + B for bold
        if ((event.ctrlKey || event.metaKey) && event.key === "b") {
          event.preventDefault();
          editor?.chain().focus().toggleBold().run();
          return true;
        }
        // Ctrl/Cmd + I for italic
        if ((event.ctrlKey || event.metaKey) && event.key === "i") {
          event.preventDefault();
          editor?.chain().focus().toggleItalic().run();
          return true;
        }
        // Ctrl/Cmd + U for underline
        if ((event.ctrlKey || event.metaKey) && event.key === "u") {
          event.preventDefault();
          editor?.chain().focus().toggleUnderline().run();
          return true;
        }
        // Ctrl/Cmd + K for link
        if ((event.ctrlKey || event.metaKey) && event.key === "k" && editor) {
          event.preventDefault();
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL eingeben:", previousUrl);

          if (url === null) {
            return true;
          }

          if (url === "") {
            editor.chain().focus().unsetLink().run();
            return true;
          }

          const urlWithProtocol = url.match(/^https?:\/\//)
            ? url
            : `https://${url}`;
          editor.chain().focus().toggleLink({ href: urlWithProtocol }).run();
          return true;
        }
        return false;
      },
    },
  });

  // Ensure editor is destroyed when component unmounts or readOnly changes
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="h-full flex flex-col relative">
      {editor && !readOnly && <TiptapToolbar editor={editor} />}
      {editor ? ( // Always render EditorContent if editor exists
        <EditorContent
          editor={editor}
          className={`h-full overflow-y-auto ${
            !readOnly ? "border border-gray-300" : "" // Only add border if editable
          } rounded p-2 mt-2 tiptap-paragraph-editor ${textSizeClass}`}
        />
      ) : (
        // Fallback for initial render or if editor fails (shouldn't happen with editable prop)
        <div
          className={`prose prose-sm max-w-none ${textSizeClass} p-2`} // Add basic styling
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}

```

# components/blocks/video-block.tsx

```tsx
"use client";

import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Hilfsfunktion zum Bereinigen von Dateinamen (für zukünftige Upload-Logik) ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

interface VideoBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string; // URL to the video
  isSelected?: boolean;
  onSelect?: () => void;
}

export function VideoBlock({
  blockId,
  dropAreaId,
  content,
  isSelected,
  onSelect,
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK,
    item: {
      id: blockId,
      type: "video",
      content,
      sourceDropAreaId: dropAreaId,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(dragRef);

  // Extract filename from URL if not provided, then sanitize it
  const rawFileName = content.split("/").pop() || "Video File";
  const displayFileName = sanitizeFilename(rawFileName); // Use the function

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load video");
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      {isLoading && (
        <div className="flex h-48 items-center justify-center bg-gray-100">
          <Film className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      )}

      {error && (
        <div className="flex h-48 items-center justify-center bg-red-50 text-red-500">
          <Film className="mr-2 h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      <video
        ref={videoRef}
        src={content}
        className={cn(
          "w-full rounded-md",
          isLoading && "hidden",
          error && "hidden"
        )}
        controls
        onLoadedData={handleLoadedData}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Display the sanitized filename */}
      <p
        className="mt-2 text-center text-sm text-gray-600 truncate"
        title={displayFileName}
      >
        {displayFileName}
      </p>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity",
          "group-hover:opacity-100",
          (isLoading || error) && "hidden"
        )}
      >
        <button
          onClick={handlePlayPause}
          className="rounded-full bg-white p-3 text-gray-900 shadow-lg hover:bg-gray-100"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

```

# components/canvas/canvas.tsx

```tsx
"use client";

import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { DropArea } from "./drop-area/drop-area";
import { ViewportSelector } from "./viewport-selector";
import React, { useEffect, useState, useRef, createRef } from "react"; // Added React import
import { getViewportStyles } from "@/lib/utils/viewport-utils";
import { useDrop } from "react-dnd"; // Added useDrop, removed DropTargetMonitor import
import { ItemTypes } from "@/lib/item-types"; // Added ItemTypes
// Removed unused BlockType, DropAreaType imports
import { isDropAreaEmpty } from "@/lib/utils/drop-area-utils"; // Added utility
import { InsertionIndicator } from "./drop-area/insertion-indicator"; // Import the new component
import Preview from "@/components/preview/preview";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the type for the item being dragged (consistent with useDropArea)
interface DragItem {
  // Keep this interface
  // Keep this interface
  id?: string;
  type: string;
  content: string;
  sourceDropAreaId?: string;
}

export default function Canvas() {
  const {
    dropAreas,
    cleanupEmptyDropAreas,
    insertBlockInNewArea, // Get the new store action
    previewMode,
    setPreviewMode,
  } = useBlocksStore();
  const { viewport } = useViewport();
  const [hoveredInsertionIndex, setHoveredInsertionIndex] = useState<
    number | null
  >(null);

  // Refs for each drop area element
  const dropAreaRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  // Ref for tracking mouse movement timeouts
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Keep for inactivity reset (if re-enabled)
  // Removed unused lastCursorPositionRef
  const hideIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for hysteresis timer

  // Filter out consecutive empty drop areas for rendering (keep existing logic)
  const filteredDropAreas = dropAreas.filter((area, index) => {
    if (index === 0) return true;

    const prevArea = dropAreas[index - 1];
    const currentArea = area;
    const isPrevEmpty =
      isDropAreaEmpty(prevArea) &&
      (!prevArea.isSplit || prevArea.splitAreas.every(isDropAreaEmpty));
    const isCurrentEmpty =
      isDropAreaEmpty(currentArea) &&
      (!currentArea.isSplit || currentArea.splitAreas.every(isDropAreaEmpty));
    return !(isPrevEmpty && isCurrentEmpty);
  });

  // Run cleanup on component mount and when dropAreas change
  useEffect(() => {
    // Ensure refs array matches the number of filtered drop areas
    dropAreaRefs.current = filteredDropAreas.map(
      (_, i) => dropAreaRefs.current[i] ?? createRef<HTMLDivElement>()
    );
    cleanupEmptyDropAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanupEmptyDropAreas, dropAreas.length]); // filteredDropAreas is derived from dropAreas

  // Cleanup effect to remove any timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Safely clear timeouts on component unmount
      if (inactivityTimeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(inactivityTimeoutRef.current);
      }

      // Clear hysteresis timer on unmount
      const hideIndicatorTimeout = hideIndicatorTimeoutRef.current;
      if (hideIndicatorTimeout) {
        clearTimeout(hideIndicatorTimeout);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // --- Centralized Drop Logic for Gaps ---
  const [, drop] = useDrop<DragItem, void, { isOverCanvas: boolean }>({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK],
    hover: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const isOverCurrent = monitor.isOver({ shallow: true });

      // Early return if we don't have the necessary data
      if (!isOverCurrent || !clientOffset) {
        // If not hovering, start the timer to hide the indicator (if it's visible)
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current // Only start if not already timing out
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 150); // Hide after 150ms delay
        }
        return;
      }

      // --- Inactivity Timer Logic (Currently Disabled) ---
      // if (inactivityTimeoutRef.current) { ... }
      // ---

      // Get container and check bounds
      const dropContainer = document.querySelector(
        '[data-drop-container="true"]'
      ) as HTMLElement;
      if (!dropContainer) return;
      const dropTargetRect = dropContainer.getBoundingClientRect();
      const { x: cursorX, y: cursorY } = clientOffset;
      const boundsPadding = 20;
      const isInBounds =
        cursorX >= dropTargetRect.left - boundsPadding &&
        cursorX <= dropTargetRect.right + boundsPadding;

      if (!isInBounds) {
        // If out of bounds, start timer to hide indicator
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current // Only start if not already timing out
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 100); // Use shorter delay for out of bounds
        }
        return;
      }

      // --- Calculate Hovered Index ---
      let currentHoveredIndex: number | null = null;
      for (let i = 0; i < filteredDropAreas.length - 1; i++) {
        const topAreaRef = dropAreaRefs.current[i];
        const bottomAreaRef = dropAreaRefs.current[i + 1];
        if (!topAreaRef?.current || !bottomAreaRef?.current) continue;

        const topRect = topAreaRef.current.getBoundingClientRect();
        const bottomRect = bottomAreaRef.current.getBoundingClientRect();
        const gapThreshold = 20;
        const midPointY =
          topRect.bottom + (bottomRect.top - topRect.bottom) / 2;
        const isVerticallyNearMidpoint =
          Math.abs(cursorY - midPointY) < gapThreshold;

        if (isVerticallyNearMidpoint) {
          const gapLeft = Math.min(topRect.left, bottomRect.left);
          const gapRight = Math.max(topRect.right, bottomRect.right);
          if (cursorX >= gapLeft && cursorX <= gapRight) {
            const topArea = filteredDropAreas[i];
            const bottomArea = filteredDropAreas[i + 1];
            const topIsEmpty = isDropAreaEmpty(topArea);
            const topHasPopulatedChildren =
              topArea.isSplit &&
              topArea.splitAreas.some((a) => !isDropAreaEmpty(a));
            const isTopPopulated = !topIsEmpty || topHasPopulatedChildren;
            const bottomIsEmptyCheck = isDropAreaEmpty(bottomArea);
            const bottomHasPopulatedChildrenCheck =
              bottomArea.isSplit &&
              bottomArea.splitAreas.some((a) => !isDropAreaEmpty(a));
            const isBottomPopulated =
              !bottomIsEmptyCheck || bottomHasPopulatedChildrenCheck;

            if (isTopPopulated && isBottomPopulated) {
              currentHoveredIndex = i + 1;
              break;
            }
          }
        }
      }

      // --- Hysteresis Logic ---
      if (currentHoveredIndex !== null) {
        // If hovering over a valid gap, clear any pending hide timer
        if (hideIndicatorTimeoutRef.current) {
          clearTimeout(hideIndicatorTimeoutRef.current);
          hideIndicatorTimeoutRef.current = null;
        }
        // Set the index immediately if it's different
        if (currentHoveredIndex !== hoveredInsertionIndex) {
          setHoveredInsertionIndex(currentHoveredIndex);
        }
      } else {
        // If not hovering over a valid gap, start timer to hide (if not already started)
        if (
          hoveredInsertionIndex !== null &&
          !hideIndicatorTimeoutRef.current
        ) {
          hideIndicatorTimeoutRef.current = setTimeout(() => {
            setHoveredInsertionIndex(null);
            hideIndicatorTimeoutRef.current = null; // Clear ref after execution
          }, 150); // Hide after 150ms delay
        }
      }
      // --- End Hysteresis Logic ---
    },
    drop: (item) => {
      // Clear any inactivity timeout on drop (if re-enabled later)
      // if (inactivityTimeoutRef.current) { ... }

      // *** Clear hysteresis timeout on drop ***
      if (hideIndicatorTimeoutRef.current) {
        clearTimeout(hideIndicatorTimeoutRef.current);
        hideIndicatorTimeoutRef.current = null;
      }

      if (hoveredInsertionIndex !== null) {
        // console.log( // Removed log
        //   `Canvas: Drop detected in gap at index ${hoveredInsertionIndex}`
        // );
        insertBlockInNewArea(item, hoveredInsertionIndex);
        setHoveredInsertionIndex(null); // Reset state immediately on drop
        return undefined;
      }
      // console.log("Canvas: Drop not in gap, letting DropArea handle."); // Removed log
      return undefined;
    },
    collect: (monitor) => ({
      isOverCanvas: !!monitor.isOver({ shallow: true }),
    }),
  });
  // --- End Centralized Drop Logic ---

  // Callback ref to connect the drop target
  const dropRefCallback = (node: HTMLDivElement | null) => {
    drop(node); // Call the react-dnd connector function
  };

  return (
    <div className="flex-1 bg-muted h-full pt-24">
      {/* Added pt-6 for top padding, and px-6 for horizontal padding */}
      <div className="px-6">
        {/* Header with centered viewport selector and right-aligned preview toggle */}
        <div className="relative flex justify-center items-center mb-6">
          <ViewportSelector />
          <div className="absolute right-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Vorschau beenden</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Vorschau</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Added px-6 pb-6 for padding */}
      <div className="px-6 pb-6">
        {previewMode ? (
          <Preview />
        ) : (
          /* Canvas container with proper width */
          <div
            className={`mx-auto ${
              viewport === "desktop" ? "w-[90%]" : "w-auto"
            } flex justify-center`}
          >
            <div
              className={`bg-card rounded-2xl transition-all duration-300 shadow-md overflow-hidden ${
                viewport === "desktop" ? "w-full" : ""
              }`}
              style={getViewportStyles(viewport)}
            >
              {/* Attach the drop ref using the callback */}
              <div
                ref={dropRefCallback}
                className="w-full"
                data-drop-container="true"
              >
                {filteredDropAreas.map((dropArea, index) => (
                  <React.Fragment key={`${dropArea.id}-${index}`}>
                    <InsertionIndicator
                      isVisible={index === hoveredInsertionIndex}
                    />
                    <DropArea
                      ref={dropAreaRefs.current[index]}
                      dropArea={dropArea}
                      showSplitIndicator={viewport !== "mobile"}
                      viewport={viewport}
                    />
                  </React.Fragment>
                ))}
                <InsertionIndicator
                  isVisible={filteredDropAreas.length === hoveredInsertionIndex}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

```

# components/canvas/custom-drag-layer.tsx

```tsx
"use client";

import React from "react";
import { useDragLayer, DragLayerMonitor } from "react-dnd"; // Import DragLayerMonitor
import { ItemTypes } from "@/lib/item-types";
import { Move } from "@/lib/icons";
import { getBlockStyle } from "@/lib/utils/block-utils";
// Import the actual block components
import { HeadingBlock } from "@/components/blocks/heading-block";
import { ParagraphBlock } from "@/components/blocks/paragraph-block";
import type { Level } from "@tiptap/extension-heading"; // Import Level type

// Define specific types for the dragged items
interface SidebarDragItem {
  type: string; // The block type (e.g., 'heading')
  content: string;
  isSidebarItem: true;
}

interface BlockDragItem {
  id: string;
  type: typeof ItemTypes.EXISTING_BLOCK;
  originalType: string; // The actual block type (e.g., 'heading')
  content: string;
  sourceDropAreaId: string;
  originalIndex: number;
  headingLevel?: number;
}

// Union type for the item collected by the drag layer
type DragLayerItem = SidebarDragItem | BlockDragItem;

// Preview component rendering logic
function BlockPreview({
  item,
  itemType,
}: {
  item: DragLayerItem; // Use the specific union type
  itemType: string | symbol | null;
}) {
  const isExistingBlock = itemType === ItemTypes.EXISTING_BLOCK;
  // Determine the type based on whether it's an existing block or a sidebar item
  const blockTypeToRender = isExistingBlock
    ? (item as BlockDragItem).originalType
    : item.type;
  // Get base style - remove 'as any' cast
  const blockStyle = getBlockStyle(item, "desktop");

  // Render actual components for existing blocks
  if (isExistingBlock) {
    const existingItem = item as BlockDragItem; // Type assertion
    if (blockTypeToRender === "heading") {
      // Validate and cast headingLevel to Level
      const validLevels: Level[] = [1, 2, 3, 4, 5, 6];
      const level = (
        validLevels.includes((existingItem.headingLevel || 1) as Level)
          ? existingItem.headingLevel || 1
          : 1
      ) as Level;

      return (
        <HeadingBlock
          blockId={existingItem.id}
          dropAreaId={existingItem.sourceDropAreaId}
          content={existingItem.content}
          level={level} // Pass validated level
          readOnly={true}
          onChange={() => {}} // Dummy onChange for readOnly
        />
      );
    }
    if (blockTypeToRender === "paragraph") {
      return (
        <ParagraphBlock
          blockId={existingItem.id}
          dropAreaId={existingItem.sourceDropAreaId}
          content={existingItem.content}
          readOnly={true}
          // viewport prop might not be needed for preview
        />
      );
    }
    // Add cases for other existing block types if needed
  }

  // --- Fallback / Sidebar Item Previews ---
  const sidebarItem = item as SidebarDragItem; // Type assertion

  // Image block (applies to both sidebar and existing if not handled above)
  if (blockTypeToRender === "image") {
    return (
      <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-md">
        <span className="text-muted-foreground">Bild</span>
      </div>
    );
  }

  // Sidebar Heading/Paragraph Preview (simple HTML)
  if (
    !isExistingBlock &&
    (blockTypeToRender === "heading" || blockTypeToRender === "paragraph")
  ) {
    return (
      <div
        className={
          blockTypeToRender === "heading"
            ? `${blockStyle} prose prose-sm max-w-none`
            : "prose prose-sm max-w-none"
        }
        dangerouslySetInnerHTML={{
          __html:
            sidebarItem.content ||
            (blockTypeToRender === "heading"
              ? "Überschrift"
              : "Paragraph text"),
        }}
      />
    );
  }

  // Default for other block types (e.g., button, form, divider from sidebar)
  // Or fallback for existing blocks not explicitly handled above
  return (
    <div className={blockStyle}>{sidebarItem.content || blockTypeToRender}</div>
  );
}

// Simple preview for the drag handle itself (fallback or other types)
function HandlePreview() {
  return (
    <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-md opacity-75">
      <Move size={14} />
    </div>
  );
}

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100, // Ensure it's above everything else
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(
  initialOffset: { x: number; y: number } | null,
  currentOffset: { x: number; y: number } | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;

  // Use a smaller offset to keep it close to the cursor
  const offsetX = 10;
  const offsetY = 5;

  const transform = `translate(${x + offsetX}px, ${y + offsetY}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export function CustomDragLayer() {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor: DragLayerMonitor<DragLayerItem>) => ({
      // Use specific item type
      // Use DragLayerMonitor type
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  // Re-enable the condition to only show the layer when dragging an existing block
  // or potentially other types if needed in the future.
  // For now, we only care about EXISTING_BLOCK previews being accurate.
  // Only render preview for existing blocks being dragged on the canvas
  if (!isDragging || itemType !== ItemTypes.EXISTING_BLOCK) {
    return null;
  }

  function renderPreview() {
    // Check item and itemType before rendering BlockPreview
    if (item && itemType) {
      // Render the preview within the styled container
      return (
        <div
          className="p-4 bg-background border rounded-lg shadow-lg relative border-border"
          style={{
            width: "300px", // Fixed width for preview
            maxHeight: "200px", // Max height
            overflow: "hidden", // Hide overflow
            // Add pointer-events: none? Maybe not needed due to layerStyles
          }}
        >
          <BlockPreview item={item} itemType={itemType} />
        </div>
      );
    }
    // Fallback if item/itemType is somehow invalid during drag
    return <HandlePreview />;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderPreview()}
      </div>
    </div>
  );
}

```

# components/canvas/drop-area.tsx

```tsx
"use client";

import { useDrop } from "react-dnd";
import { useState } from "react";
import { ItemTypes } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { SquareSplitHorizontalIcon as SplitHorizontal } from "lucide-react";

interface DropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator?: boolean;
  viewport: ViewportType;
}

export function DropArea({
  dropArea,
  showSplitIndicator = false,
  viewport,
}: DropAreaProps) {
  const { addBlock, splitDropArea, canSplit, moveBlock } = useBlocksStore();
  const [isHovering, setIsHovering] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK], // Accept existing blocks too
    drop: (item: {
      id?: string;
      type: string;
      content: string;
      sourceDropAreaId?: string;
    }) => {
      // Handle the drop event
      if (item.sourceDropAreaId) {
        // This is an existing block being moved
        moveBlock(item.id!, item.sourceDropAreaId, dropArea.id);
      } else {
        // This is a new block being added
        addBlock(
          {
            type: item.type || "square", // Default to square if type is not provided
            content: item.content || "Dropped Square", // Default content if not provided
            dropAreaId: dropArea.id,
          },
          dropArea.id
        );
      }
      return { name: `Drop Area ${dropArea.id}` };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Determine visual cues based on drop state
  const getDropAreaStyles = () => {
    let baseClasses =
      "w-full min-h-[120px] rounded-xl border-2 relative bento-box transition-all duration-200";

    // Empty drop area has dashed border
    if (dropArea.blocks.length === 0) {
      baseClasses += " border-dashed";
    } else {
      baseClasses += " border-transparent";
    }

    // Visual cues for drag operations
    if (isOver && canDrop) {
      // Active drop target - strong visual cue
      baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
    } else if (canDrop) {
      // Potential drop target - subtle visual cue
      baseClasses += " border-primary/50 bg-primary/5";
    } else {
      // Default state
      baseClasses += " border-border";
    }

    return baseClasses;
  };

  const handleSplit = () => {
    if (canSplit(dropArea.id, viewport)) {
      splitDropArea(dropArea.id);
    }
  };

  // Only show split indicator if:
  // 1. showSplitIndicator is true
  // 2. The area is being hovered
  // 3. The area is not currently being dragged over
  // 4. The area doesn't have any blocks yet
  // 5. The area is not already split
  // 6. The area can be split (based on split level restrictions)
  const shouldShowSplitIndicator =
    showSplitIndicator &&
    isHovering &&
    !isOver &&
    dropArea.blocks.length === 0 &&
    !dropArea.isSplit &&
    canSplit(dropArea.id, viewport);

  // For mobile viewport, always stack vertically
  if (
    viewport === "mobile" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full space-y-4">
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={false}
          viewport={viewport}
        />
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={false}
          viewport={viewport}
        />
      </div>
    );
  }

  // For tablet viewport with 2x2 grid layout
  if (
    viewport === "tablet" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    // Check if this is a second-level split (creating a 2x2 grid)
    if (dropArea.splitAreas.some((area) => area.isSplit)) {
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Render the first split area */}
          {dropArea.splitAreas[0].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[0]}
                showSplitIndicator={false}
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[0]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[0]}
                showSplitIndicator={false}
                viewport={viewport}
              />
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[1]}
                showSplitIndicator={false}
                viewport={viewport}
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[1]}
              showSplitIndicator={showSplitIndicator}
              viewport={viewport}
            />
          )}
        </div>
      );
    }

    // First-level split for tablet - side by side
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  // For desktop with up to 4-in-a-row layout
  if (
    viewport === "desktop" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
        <div className="flex-1 bento-box">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={drop}
      className={getDropAreaStyles()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Drop indicator - show when dragging over */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">
            Drop here
          </div>
        </div>
      )}

      {/* Split indicator - only show under specific conditions */}
      {shouldShowSplitIndicator && (
        <button
          onClick={handleSplit}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background p-2 rounded-full shadow-md hover:bg-secondary transition-colors"
          title="Split drop area horizontally"
        >
          <SplitHorizontal size={16} className="text-primary" />
        </button>
      )}

      {dropArea.blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground p-8">
          <p className="text-sm">Lege deine Elemente hier ab</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {dropArea.blocks.map((block) => (
            <CanvasBlock key={block.id} block={block} viewport={viewport} />
          ))}
        </div>
      )}
    </div>
  );
}

```

# components/canvas/drop-area/desktop-drop-area.tsx

```tsx
"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface DesktopDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const DesktopDropArea = forwardRef<HTMLDivElement, DesktopDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // State for merge animation

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="desktop"
        />
      );
    }

    // Get IDs for the split areas
    const leftAreaId = dropArea.splitAreas[0].id;
    const rightAreaId = dropArea.splitAreas[1].id;
    // Check directly if these two areas can be merged using the store function
    const areasCanMerge = canMerge(leftAreaId, rightAreaId);

    // Handler for merge gap click with animation
    const handleMergeWithAnimation = () => {
      if (areasCanMerge) {
        setIsMerging(true); // Start animation
        setTimeout(() => {
          mergeDropAreas(leftAreaId, rightAreaId); // Call store action
          // No need to setIsMerging(false) as the component will likely unmount/re-render
        }, 300);
      }
    };

    // Check if either split area has content
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full flex items-center min-h-full relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        {/* Merging Text Overlay - Rendered centrally within the parent */}
        {isMerging && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird zusammengeführt...
            </div>
          </div>
        )}
        {/* Removed Merging Animation Overlay from here */}
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={true}
            viewport="desktop"
          />
        </div>
        {/* Center the indicator wrapper and handle merge logic */}
        <div className="self-center px-2">
          {" "}
          {/* Added some padding */}
          {/* MergeGapIndicator now gets canMerge status and calls merge directly */}
          <MergeGapIndicator
            canMerge={areasCanMerge}
            onClick={handleMergeWithAnimation}
          />
        </div>
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={true}
            viewport="desktop"
          />
        </div>

        {/* Delete button for the entire split area */}
        {showDeleteButton && hasContent && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title="Gesamten Drop-Bereich löschen"
            aria-label="Delete entire drop area"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Add display name for React DevTools
DesktopDropArea.displayName = "DesktopDropArea";

```

# components/canvas/drop-area/drop-area-content.tsx

```tsx
"use client";

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import type { DropAreaType, BlockType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { CanvasBlock } from "@/components/blocks/canvas-block";
import { useDrop, type DropTargetMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
import { InsertionIndicator } from "./insertion-indicator"; // Import existing indicator

interface DropAreaContentProps {
  dropArea: DropAreaType;
  viewport: ViewportType;
}

// Define the types for dragged items this component can accept
interface DraggedExistingBlockItem {
  id: string;
  sourceDropAreaId: string;
  type: typeof ItemTypes.EXISTING_BLOCK; // Use literal type
  originalIndex: number;
  originalType: string; // Add original type
  content: string; // Add content (might be needed by drop handler)
}

// Interface for new blocks that are specifically Headings
interface DraggedHeadingBlockItem extends DraggedNewBlockItem {
  type: "heading"; // Literal type for specific block type check
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6; // Use specific union type matching BlockType
}

interface DraggedNewBlockItem {
  id?: string; // New blocks might not have an ID yet
  type: string; // Use string, assuming it holds the specific block type like 'heading', 'paragraph'
  content: string;
  sourceDropAreaId?: string; // Might not be relevant for new blocks
}

type AcceptedDragItem = DraggedExistingBlockItem | DraggedNewBlockItem;

// Type guard to check if a dragged item is a heading block
function isDraggedHeading(
  item: AcceptedDragItem
): item is DraggedHeadingBlockItem {
  // Check the specific block type string and ensure headingLevel exists and is a number
  return (
    item.type === "heading" &&
    "headingLevel" in item &&
    typeof item.headingLevel === "number"
  );
}

export function DropAreaContent({ dropArea, viewport }: DropAreaContentProps) {
  const { reorderBlocks } = useBlocksStore();
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each block item
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // Index for insertion indicator
  const [draggedItemOriginalIndex, setDraggedItemOriginalIndex] = useState<
    number | null
  >(null); // Track original index of dragged item

  // Ensure blockRefs array has the correct size
  useEffect(() => {
    blockRefs.current = blockRefs.current.slice(0, dropArea.blocks.length);
  }, [dropArea.blocks.length]);

  // Removed redundant useEffect for dragEnd listener

  // Expose a reset function globally (use with caution - consider context/store later)
  useEffect(() => {
    // Attaching to window for simplicity (consider alternatives for production)
    window.resetDropAreaContentHover = () => {
      console.log("[Window Reset] Resetting DropAreaContent hover state");
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
    };
    return () => {
      // Cleanup window property
      delete window.resetDropAreaContentHover;
    };
  }, []); // Empty dependency array ensures it runs once

  // Reset hover state when window is blurred
  useEffect(() => {
    const handleBlur = () => {
      setHoverIndex(null);
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  // --- Container Drop Logic ---
  const [{ isOverContainer, canDropOnContainer }, dropContainer] = useDrop<
    AcceptedDragItem, // Use the union type
    void,
    { isOverContainer: boolean; canDropOnContainer: boolean }
  >({
    accept: [ItemTypes.EXISTING_BLOCK, ItemTypes.BLOCK, ItemTypes.SQUARE],
    canDrop: () => {
      // Revised logic: If canDrop is called, react-dnd has already verified
      // the item type against the 'accept' array. So, we can always return true here.
      // The actual handling logic is in the drop handlers.
      return true;
    },
    hover: (item, monitor: DropTargetMonitor<AcceptedDragItem>) => {
      // Check if item is an existing block to access originalIndex safely
      const isExistingBlock = item.type === ItemTypes.EXISTING_BLOCK;
      const originalIndex = isExistingBlock
        ? (item as DraggedExistingBlockItem).originalIndex
        : null;

      if (!containerRef.current || !monitor.isOver({ shallow: true })) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null); // Reset original index tracking too
        return; // Only one return needed
      }

      // Store original index only if it's an existing block
      setDraggedItemOriginalIndex(originalIndex);

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        setHoverIndex(null); // Clear hover if no offset
        return;
      }

      const hoverClientY = clientOffset.y; // Keep only one declaration
      let calculatedHoverIndex = dropArea.blocks.length; // Default to inserting at the end

      // Use a for loop instead of forEach for proper break functionality
      for (let index = 0; index < blockRefs.current.length; index++) {
        const blockRef = blockRefs.current[index];
        if (!blockRef) continue;

        const domNode = blockRef;
        const hoverBoundingRect = domNode.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientYRelative = hoverClientY - hoverBoundingRect.top;

        // console.log( // Keep logs commented out
        //   `[Hover Loop Index ${index}] RelativeY: ${hoverClientYRelative.toFixed(
        //     2
        //   )}, MiddleY: ${hoverMiddleY.toFixed(2)}`
        // );

        if (hoverClientYRelative < hoverMiddleY) {
          calculatedHoverIndex = index;
          // console.log( // Keep logs commented out
          //   `[Hover Loop Index ${index}] Condition Met (< middle). Setting index to ${calculatedHoverIndex}. EXITING LOOP.`
          // );
          break; // Use proper break to exit the loop
        } else {
          calculatedHoverIndex = index + 1;
          // console.log( // Keep logs commented out
          //   `[Hover Loop Index ${index}] Condition NOT Met (>= threshold). Setting index to ${calculatedHoverIndex}. Continuing loop.`
          // );
        }
      }

      // console.log( // Keep logs commented out
      //   `Final calculated hover index: ${calculatedHoverIndex}, Original index: ${originalIndex}`
      // );

      // Prevent indicator flicker when dragging existing item over its own position or the gap after it
      if (
        isExistingBlock &&
        (calculatedHoverIndex === originalIndex ||
          calculatedHoverIndex === (originalIndex ?? -1) + 1)
      ) {
        // console.log( // Keep logs commented out
        //   `Setting hover index to null (would be moving to same position)`
        // );
        setHoverIndex(null);
      } else {
        // console.log(`Setting hover index to ${calculatedHoverIndex}`); // Keep logs commented out
        setHoverIndex(calculatedHoverIndex);
      }
    },
    drop: (item, monitor) => {
      // Get the fresh item reference
      const freshItem = monitor.getItem();

      // Create a unique ID for tracking this drop operation
      const dropId = `drop-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Check if drop was already handled elsewhere
      if (monitor.didDrop()) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Ensure we are over the container specifically
      if (!monitor.isOver({ shallow: true })) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      // Get the current target index from hover state
      const targetIndex = hoverIndex;
      if (targetIndex === null) {
        setHoverIndex(null);
        setDraggedItemOriginalIndex(null);
        return undefined;
      }

      try {
        // Handle internal reordering
        if (freshItem.type === ItemTypes.EXISTING_BLOCK) {
          const existingItem = freshItem as DraggedExistingBlockItem;

          // Only handle if it's an internal reorder (same drop area)
          if (existingItem.sourceDropAreaId !== dropArea.id) {
            return undefined; // Let parent useDropArea handle external moves
          }

          const sourceIndex = existingItem.originalIndex;

          // Prevent dropping in the same spot or right after itself
          if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
            return undefined;
          }

          // Calculate adjusted target index
          const adjustedTargetIndex =
            targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

          // Create a new copy of the blocks array
          const newBlocks = [...dropArea.blocks];

          // Remove the item from its original position
          const [movedItem] = newBlocks.splice(sourceIndex, 1);

          // Insert at the new position
          newBlocks.splice(adjustedTargetIndex, 0, movedItem);

          // Apply the reordering with the updated blocks array
          setTimeout(() => {
            reorderBlocks(dropArea.id, newBlocks);
          }, 0);
        }
        // Handle new blocks onto populated areas
        else {
          const newItem = freshItem as DraggedNewBlockItem;

          // Prepare base block data
          const newBlockDataBase = {
            type: newItem.type,
            content: newItem.content || "",
            dropAreaId: dropArea.id,
          };

          // Add heading level if it's a heading block
          const finalNewBlockData = isDraggedHeading(freshItem)
            ? {
                ...newBlockDataBase,
                type: "heading",
                headingLevel: freshItem.headingLevel,
              }
            : newBlockDataBase;

          // Schedule block addition AFTER drop handler returns
          setTimeout(() => {
            useBlocksStore
              .getState()
              .addBlockAtIndex(finalNewBlockData, dropArea.id, targetIndex);
          }, 0);
        }
      } catch (error: unknown) {
        console.error(`[DropAreaContent:${dropId}] Error during drop:`, error);
      }

      // Reset state
      setHoverIndex(null);
      setDraggedItemOriginalIndex(null);
      return undefined;
    },
    collect: (monitor) => ({
      isOverContainer: !!monitor.isOver({ shallow: true }),
      canDropOnContainer: !!monitor.canDrop(),
    }),
  });

  // Attach drop ref to the container
  dropContainer(containerRef);

  // If drop area is empty, show placeholder
  if (dropArea.blocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-8">
        <p className="text-sm">Lege deine Elemente hier ab</p>
      </div> // Add closing tag
    );
  }

  // Use the consistent InsertionIndicator component
  // (Assuming it takes no props or suitable defaults)

  return (
    <div
      ref={containerRef} // Attach container ref
      className={`space-y-1 p-4 ${
        isOverContainer && canDropOnContainer ? "bg-primary/5" : "" // Subtle bg on valid hover
      }`}
    >
      {/* Render indicator at the beginning if hoverIndex is 0 */}
      <InsertionIndicator isVisible={hoverIndex === 0} />

      {dropArea.blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          <BlockItem // Use the component defined below
            block={block}
            index={index}
            totalBlocks={dropArea.blocks.length}
            viewport={viewport}
            isBeingDragged={draggedItemOriginalIndex === index} // Pass down drag status
          />
          {/* Render indicator between items */}
          <InsertionIndicator isVisible={hoverIndex === index + 1} />
        </React.Fragment>
      ))}
    </div> // Add closing tag
  );
}

// Simplified BlockItem component (forwardRef is needed to pass the ref down)
interface BlockItemProps {
  block: BlockType;
  index: number;
  totalBlocks: number;
  viewport: ViewportType;
  isBeingDragged: boolean;
}

const BlockItem = React.forwardRef<HTMLDivElement, BlockItemProps>(
  ({ block, index, totalBlocks, viewport, isBeingDragged }, ref) => {
    return (
      <div
        ref={ref} // Attach the forwarded ref here
        className={`relative transition-opacity duration-200 ${
          // Removed py-1 padding
          isBeingDragged ? "opacity-30" : "opacity-100" // Style when dragged
        }`}
        data-index={index} // Keep data attributes if needed
        data-block-id={block.id}
      >
        <CanvasBlock
          block={block}
          index={index}
          viewport={viewport}
          isOnlyBlockInArea={totalBlocks === 1}
        />
      </div>
    );
  }
);

// Add display name for React DevTools
BlockItem.displayName = "BlockItem";

```

# components/canvas/drop-area/drop-area.tsx

```tsx
"use client";

import React, { useState, useEffect, forwardRef } from "react"; // Import React, forwardRef, useState
import { useDropArea } from "@/lib/hooks/use-drop-area";
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { DropAreaContent } from "./drop-area-content";
import { MobileDropArea } from "./mobile-drop-area";
import { TabletDropArea } from "./tablet-drop-area";
import { DesktopDropArea } from "./desktop-drop-area";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2, Plus } from "lucide-react";

interface DropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator?: boolean;
  viewport: ViewportType;
}

// Wrap component with forwardRef
export const DropArea = forwardRef<HTMLDivElement, DropAreaProps>(
  (
    { dropArea, showSplitIndicator = false, viewport },
    ref // Receive the forwarded ref
  ) => {
    const { splitPopulatedDropArea, splitDropArea, canSplit, deleteDropArea } =
      useBlocksStore();
    const [isSplitting, setIsSplitting] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMouseHovering, setIsMouseHovering] = useState(false); // State for mouse hover

    const {
      isOver, // Is an item hovering directly over this area?
      // Removed unused isHovering
      drop, // The drop ref connector from react-dnd for this area
      getDropAreaStyles, // Function to get dynamic styles based on state
    } = useDropArea(dropArea, viewport); // Pass dropArea and viewport

    // Check if this drop area can be split based on viewport and level
    const canSplitThisArea = canSplit(dropArea.id, viewport);
    const isAreaEmpty = dropArea.blocks.length === 0;

    // --- NEW: Logic for showing the split button ---
    const shouldShowSplitButton =
      showSplitIndicator && // Prop check from parent
      isMouseHovering && // Use mouse hover state
      !isOver && // Is an item NOT being dragged over?
      isAreaEmpty && // Is the area empty?
      canSplitThisArea; // Can this specific area be split?

    // --- NEW: Logic for showing the split button on POPULATED areas ---
    const shouldShowSplitButtonPopulated =
      showSplitIndicator && // Prop check from parent
      isMouseHovering && // Use mouse hover state
      !isOver && // Is an item NOT being dragged over?
      !isAreaEmpty && // Area must be POPULATED
      canSplitThisArea; // Can this specific area be split?

    // Handle splitting a populated drop area (when split button is clicked)
    const handleSplitPopulated = () => {
      if (canSplitThisArea && dropArea.blocks.length > 0) {
        setIsSplitting(true); // Show splitting animation
        // Add a small delay to show the animation before actually splitting
        setTimeout(() => {
          splitPopulatedDropArea(dropArea.id); // Call store action
          setIsSplitting(false); // Hide animation
        }, 300);
      }
    };

    // Handle splitting an empty drop area (when split indicator is clicked)
    const handleSplitEmpty = () => {
      if (canSplitThisArea && dropArea.blocks.length === 0) {
        setIsSplitting(true); // Show splitting animation
        // Add a small delay to show the animation before actually splitting
        setTimeout(() => {
          splitDropArea(dropArea.id); // Call store action from drop-area-actions.ts
          setIsSplitting(false); // Hide animation
        }, 300);
      } // Added missing closing brace for the if statement
    }; // Added missing closing brace for the handleSplitEmpty function

    // Reset animation states if the drop area ID changes
    useEffect(() => {
      setIsSplitting(false);
    }, [dropArea.id]);

    // --- Render different layouts based on viewport and split state ---
    // If the area is split and has 2 children, render the specific layout component
    if (dropArea.isSplit && dropArea.splitAreas.length === 2) {
      if (viewport === "mobile") {
        return (
          <MobileDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
      if (viewport === "tablet") {
        return (
          <TabletDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
      if (viewport === "desktop") {
        return (
          <DesktopDropArea
            ref={ref} // Pass ref down
            dropArea={dropArea}
            showSplitIndicator={showSplitIndicator}
          />
        );
      }
    }

    // --- Default rendering for non-split or single-child split areas ---
    // Combine the forwarded ref and the drop ref
    const combinedRef = (node: HTMLDivElement | null) => {
      // Assign to the forwarded ref (for position calculation in Canvas)
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      // Assign to the drop ref (for react-dnd)
      drop(node);
    };

    return (
      <div
        ref={combinedRef} // Use the combined ref
        className={`group relative ${getDropAreaStyles()} ${
          isSplitting ? "scale-105 shadow-lg" : ""
        } mb-6 transition-all duration-300`} // Removed isParentMerging style
        onMouseEnter={() => {
          // console.log(`Mouse enter ${dropArea.id}`); // Reduce console noise
          setShowDeleteButton(true);
          setIsMouseHovering(true); // Set mouse hover state
        }}
        onMouseLeave={(e) => {
          // Only set to false if we're leaving the container itself,
          // not just moving the mouse over a child element within the container.
          if (
            e.relatedTarget instanceof Node &&
            !e.currentTarget.contains(e.relatedTarget)
          ) {
            // console.log(`Mouse leave ${dropArea.id}`); // Reduce console noise
            setShowDeleteButton(false);
            setIsMouseHovering(false); // Clear mouse hover state
          }
        }}
      >
        {/* Splitting Animation Overlay */}
        {isSplitting && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-xl z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird aufgeteilt...
            </div>
          </div>
        )}

        {/* Split Button for EMPTY areas */}
        {shouldShowSplitButton && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent potential parent handlers
                handleSplitEmpty(); // Call the split function for empty areas
              }}
              className="pointer-events-auto p-2 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all"
              title="Drop-Bereich aufteilen (leer)"
              aria-label="Leeren Drop-Bereich aufteilen"
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        {/* Split Button for POPULATED areas - positioned top-right */}
        {shouldShowSplitButtonPopulated && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent potential parent handlers
              handleSplitPopulated(); // Call the split function for populated areas
            }}
            // Position under delete button (-right-4), same size and hover effect
            className="absolute top-6 -right-4 p-2 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 pointer-events-auto z-20"
            title="Drop-Bereich aufteilen (enthält Blöcke)"
            aria-label="Befüllten Drop-Bereich aufteilen"
          >
            {/* Match delete button icon size */}
            <Plus size={16} />
          </button>
        )}

        <DropAreaContent
          dropArea={dropArea}
          viewport={viewport}
          // Removed onSplitPopulated and canSplit props as they are no longer needed here
        />

        {/* Delete button - Shows on hover for populated areas:
            - Always show for areas with multiple blocks
            - Only show for areas with a single block if that block doesn't show its own delete button
        */}
        {showDeleteButton && dropArea.blocks.length > 0 && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title="Block löschen"
            aria-label="Block löschen"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Add display name for React DevTools
DropArea.displayName = "DropArea";

```

# components/canvas/drop-area/drop-indicators.tsx

```tsx
"use client";

import { SplitHorizontal, Merge } from "@/lib/icons";

interface DropIndicatorsProps {
  isOver: boolean;
  canDrop: boolean;
  shouldShowSplitIndicator: boolean;
  shouldShowMergeIndicator: boolean;
  onSplit: () => void;
  onMerge: () => void;
  mergePosition?: "left" | "right" | "both";
}

export function DropIndicators({
  isOver,
  canDrop,
  shouldShowSplitIndicator,
  shouldShowMergeIndicator,
  onSplit,
  onMerge,
  mergePosition = "both",
}: DropIndicatorsProps) {
  return (
    <>
      {/* Drop indicator - show when dragging over */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">
            Drop here
          </div>
        </div>
      )}

      {/* Split indicator - only show under specific conditions */}
      {shouldShowSplitIndicator && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSplit();
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-blue-500 p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors text-white"
          title="Split drop area horizontally"
        >
          <SplitHorizontal size={16} />
        </button>
      )}

      {/* Merge indicator - show between two empty or one empty + one populated drop area */}
      {shouldShowMergeIndicator && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMerge();
          }}
          className={`absolute ${getMergePositionClasses(
            mergePosition
          )} z-10 bg-green-500 p-2 rounded-full shadow-md hover:bg-green-600 transition-colors text-white`}
          title="Merge drop areas"
        >
          <Merge size={16} />
        </button>
      )}
    </>
  );
}

// Helper function to get the correct positioning classes
function getMergePositionClasses(position: "left" | "right" | "both") {
  switch (position) {
    case "left":
      return "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
    case "right":
      return "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";
    case "both":
      return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

```

# components/canvas/drop-area/insertion-indicator.tsx

```tsx
"use client";

import React from "react";

interface InsertionIndicatorProps {
  isVisible: boolean;
}

export function InsertionIndicator({ isVisible }: InsertionIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  // Use margin to create space, keep height minimal for the bar itself
  return (
    <div
      className={`transition-opacity duration-150 ease-out ${
        isVisible ? "opacity-100 my-2" : "opacity-0 h-0 my-0" // Use margin-y (my-2) for spacing
      }`}
      aria-hidden="true"
    >
      {/* Inner visual bar - give it a small height */}
      <div className="h-2 my-4 w-full rounded-full bg-primary/40" />{" "}
      {/* Use primary color */}
    </div>
  );
}

```

# components/canvas/drop-area/merge-gap-indicator.tsx

```tsx
"use client";

import { Merge } from "lucide-react";

interface MergeGapIndicatorProps {
  canMerge: boolean;
  onClick: () => void;
}

export function MergeGapIndicator({
  canMerge,
  onClick,
}: MergeGapIndicatorProps) {
  // Always render gap div to maintain spacing, even if merge isn't available
  if (!canMerge) {
    return <div className="w-4"></div>;
  }

  return (
    // Use fixed height h-12 instead of h-full
    <div className="w-4 h-12 relative group">
      {" "}
      {/* Removed self-center */} {/* Simple highlight that appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-12 bg-transparent group-hover:bg-green-100/50 transition-colors rounded-md" />
      </div>
      {/* Merge button - use same positioning as split button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          p-2 rounded-full bg-green-500 shadow-md hover:bg-green-600
          transition-all text-white opacity-0 group-hover:opacity-100"
        title="Merge drop areas"
        aria-label="Merge drop areas"
      >
        <Merge size={16} />
      </button>
    </div>
  );
}

```

# components/canvas/drop-area/mobile-drop-area.tsx

```tsx
"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { useBlocksStore } from "@/store/blocks-store";
// Removed unused MergeGapIndicator import
import { Trash2 } from "lucide-react";

interface MobileDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const MobileDropArea = forwardRef<HTMLDivElement, MobileDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // State for merge animation

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="mobile"
        />
      );
    }

    // For mobile, get IDs for vertical split areas
    const topAreaId = dropArea.splitAreas[0].id;
    const bottomAreaId = dropArea.splitAreas[1].id;
    // Check directly if these can merge
    const areasCanMerge = canMerge(topAreaId, bottomAreaId);

    // Handler for merge gap click with animation
    const handleMergeWithAnimation = () => {
      if (areasCanMerge) {
        setIsMerging(true); // Start animation
        setTimeout(() => {
          mergeDropAreas(topAreaId, bottomAreaId); // Call store action
          // No need to setIsMerging(false) as the component will likely unmount/re-render
        }, 300);
      }
    };

    // In mobile, we want a horizontal indicator
    const MobileHorizontalMergeIndicator = () => {
      if (!areasCanMerge) {
        return <div className="h-6 my-2"></div>;
      }

      return (
        <div className="h-6 my-2 w-full relative group">
          {/* Simple highlight that appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-full bg-transparent group-hover:bg-green-100/50 transition-colors rounded-md" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMergeWithAnimation(); // Use animation handler
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            p-2 rounded-full bg-green-500 shadow-md hover:bg-green-600
            transition-all text-white opacity-0 group-hover:opacity-100"
            title="Drop-Bereiche zusammenführen"
            aria-label="Merge drop areas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
              <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2"></path>
            </svg>
          </button>
        </div>
      );
    };

    // Check if either split area has content for showing delete button
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full space-y-0 relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        {/* Merging Text Overlay - Rendered centrally within the parent */}
        {isMerging && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird zusammengeführt...
            </div>
          </div>
        )}
        {/* Removed Merging Animation Overlay from here */}
        <DropArea
          dropArea={dropArea.splitAreas[0]}
          showSplitIndicator={false} // Don't allow splitting further on mobile for now
          viewport="mobile"
          // Removed internal merge/parent merging props
        />
        <MobileHorizontalMergeIndicator />
        <DropArea
          dropArea={dropArea.splitAreas[1]}
          showSplitIndicator={false} // Don't allow splitting further on mobile for now
          viewport="mobile"
          // Removed internal merge/parent merging props
        />

        {/* Delete button for the entire split area */}
        {showDeleteButton && hasContent && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title="Gesamten Drop-Bereich löschen"
            aria-label="Delete entire drop area"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Add display name for React DevTools
MobileDropArea.displayName = "MobileDropArea";

```

# components/canvas/drop-area/tablet-drop-area.tsx

```tsx
"use client";

import React, { useState, forwardRef } from "react"; // Import React and forwardRef
import type { DropAreaType } from "@/lib/types";
import { DropArea } from "./drop-area";
import { MergeGapIndicator } from "./merge-gap-indicator";
import { useBlocksStore } from "@/store/blocks-store";
import { Trash2 } from "lucide-react";

interface TabletDropAreaProps {
  dropArea: DropAreaType;
  showSplitIndicator: boolean;
}

// Wrap with forwardRef
export const TabletDropArea = forwardRef<HTMLDivElement, TabletDropAreaProps>(
  ({ dropArea, showSplitIndicator }, ref) => {
    const { canMerge, mergeDropAreas, deleteDropArea } = useBlocksStore();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isMerging, setIsMerging] = useState(false); // State for merge animation

    if (!dropArea.isSplit || dropArea.splitAreas.length !== 2) {
      return (
        <DropArea
          dropArea={dropArea}
          showSplitIndicator={showSplitIndicator}
          viewport="tablet"
        />
      );
    }

    // Check if this is a second-level split (creating a 2x2 grid)
    if (dropArea.splitAreas.some((area) => area.isSplit)) {
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Render the first split area */}
          {dropArea.splitAreas[0].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[0]}
                showSplitIndicator={false}
                viewport="tablet"
              />
              <DropArea
                dropArea={dropArea.splitAreas[0].splitAreas[1]}
                showSplitIndicator={false}
                viewport="tablet"
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[0]}
              showSplitIndicator={showSplitIndicator}
              viewport="tablet"
            />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[0]}
                showSplitIndicator={false}
                viewport="tablet"
              />
              <DropArea
                dropArea={dropArea.splitAreas[1].splitAreas[1]}
                showSplitIndicator={false}
                viewport="tablet"
              />
            </>
          ) : (
            <DropArea
              dropArea={dropArea.splitAreas[1]}
              showSplitIndicator={showSplitIndicator}
              viewport="tablet"
            />
          )}
        </div>
      );
    }

    // --- First-level split logic (side-by-side) ---
    // Get IDs for the split areas
    const leftAreaId = dropArea.splitAreas[0].id;
    const rightAreaId = dropArea.splitAreas[1].id;
    // Check directly if these areas can merge
    const areasCanMerge = canMerge(leftAreaId, rightAreaId);

    // Handler for merge gap click with animation
    const handleMergeWithAnimation = () => {
      if (areasCanMerge) {
        setIsMerging(true); // Start animation
        setTimeout(() => {
          mergeDropAreas(leftAreaId, rightAreaId); // Call store action
          // No need to setIsMerging(false) as the component will likely unmount/re-render
        }, 300);
      }
    };

    // First-level split for tablet - side by side with merge gap
    // Check if either split area has content for showing delete button
    const hasContent =
      dropArea.splitAreas[0].blocks.length > 0 ||
      dropArea.splitAreas[1].blocks.length > 0;

    // Note: The 2x2 grid case might need ref handling too if it becomes a drop target,
    // but for now, we only need the ref on the main container for the first-level split.

    return (
      // Attach the forwarded ref here
      <div
        ref={ref}
        className="group w-full flex items-center relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
      >
        {/* Merging Text Overlay - Rendered centrally within the parent */}
        {isMerging && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Wird zusammengeführt...
            </div>
          </div>
        )}
        {/* Removed Merging Animation Overlay from here */}
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[0]}
            showSplitIndicator={showSplitIndicator}
            viewport="tablet"
          />
        </div>
        {/* Center the indicator wrapper and handle merge */}
        <div className="self-center px-2">
          <MergeGapIndicator
            canMerge={areasCanMerge}
            onClick={handleMergeWithAnimation}
          />
        </div>
        <div className="flex-1">
          <DropArea
            dropArea={dropArea.splitAreas[1]}
            showSplitIndicator={showSplitIndicator}
            viewport="tablet"
          />
        </div>

        {/* Delete button for the entire split area */}
        {showDeleteButton && hasContent && (
          <button
            onClick={() => deleteDropArea(dropArea.id)}
            className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-20"
            title="Gesamten Drop-Bereich löschen"
            aria-label="Delete entire drop area"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Add display name for React DevTools
TabletDropArea.displayName = "TabletDropArea";

```

# components/canvas/viewport-selector.tsx

```tsx
"use client";

import { useViewport } from "@/lib/hooks/use-viewport";
import { Button } from "@/components/ui/button";
import { Laptop, Tablet, Smartphone } from "lucide-react";

export function ViewportSelector() {
  const { viewport, setViewport } = useViewport();

  return (
    <div className="inline-flex items-center justify-center space-x-1 bg-card p-1 rounded-full shadow-sm border border-border">
      <Button
        variant={viewport === "desktop" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("desktop")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "desktop" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Laptop className="h-4 w-4" />
        <span className="hidden sm:inline">Desktop</span>
      </Button>
      <Button
        variant={viewport === "tablet" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("tablet")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "tablet" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Tablet className="h-4 w-4" />
        <span className="hidden sm:inline">Tablet</span>
      </Button>
      <Button
        variant={viewport === "mobile" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewport("mobile")}
        className={`flex items-center gap-2 rounded-full ${
          viewport === "mobile" ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden sm:inline">Smartphone</span>
      </Button>
    </div>
  );
}

```

# components/dashboard/dashboard-header.tsx

```tsx
"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex justify-between items-center">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle Projekte</TabsTrigger>
          <TabsTrigger value="recent">Kürzlich</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

```

# components/dashboard/project-card.tsx

```tsx
"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { deleteProjectFromStorage } from "@/lib/supabase/storage";
import type { Project } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  project,
  onClick,
  onDelete,
}: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteProjectFromStorage(project.id);
      if (success) {
        setShowDeleteDialog(false);
        if (onDelete) {
          onDelete();
        }
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Error deleting project"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        <div className="relative" onClick={onClick}>
          {error && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center z-10">
              <span className="text-sm text-destructive font-medium px-3 py-1 bg-background rounded-md">
                {error}
              </span>
            </div>
          )}
          <div
            className="aspect-video bg-muted overflow-hidden"
            style={{
              backgroundImage: project.thumbnail
                ? `url(${project.thumbnail})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!project.thumbnail && (
              <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                <span className="text-muted-foreground">
                  Keine Vorschau verfügbar
                </span>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Duplizieren
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Umbenennen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird gelöscht...
                    </>
                  ) : (
                    "Löschen"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-4" onClick={onClick}>
          <h3 className="font-medium mb-2">{project.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Zuletzt bearbeitet: {formatDate(project.updatedAt)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Erstellt: {formatDate(project.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Projekt löschen möchten? Diese
              Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

```

# components/dashboard/projects-view.tsx

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/dashboard/project-card";
import {
  listProjectsFromStorage,
  initializeStorage,
  deleteProjectFromStorage, // Need this for delete handler
} from "@/lib/supabase/storage";
import { deleteProjectFromDatabase } from "@/lib/supabase/database"; // Need this for delete handler
import type { Project } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlocksStore } from "@/store/blocks-store";

export default function ProjectsView() {
  console.log("[ProjectsView] Rendering...");
  const router = useRouter();
  const projectJustDeleted = useBlocksStore(
    (state) => state.projectJustDeleted
  );
  const deletedProjectTitle = useBlocksStore(
    (state) => state.deletedProjectTitle
  );
  const setProjectJustDeleted = useBlocksStore(
    (state) => state.setProjectJustDeleted
  );
  const setDeletedProjectTitle = useBlocksStore(
    (state) => state.setDeletedProjectTitle
  );
  const toastShownForDeletion = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Memoize the toast notifications
  const showErrorToast = useCallback((title: string, description: string) => {
    toast.error(title, {
      description: description,
    });
  }, []);

  // Force refresh when component mounts or visibility changes
  useEffect(() => {
    setRefreshCounter((prev) => prev + 1); // Initial load trigger

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshCounter((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Load projects from Supabase storage
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const storageInitialized = await initializeStorage();
        if (!storageInitialized) {
          setProjects([]);
          showErrorToast(
            "Speicherfehler",
            "Verbindung zum Cloud-Speicher nicht möglich."
          );
          setIsLoading(false);
          return;
        }
        const loadedProjects = await listProjectsFromStorage();
        setProjects(loadedProjects || []);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
        toast.error("Fehler beim Laden", {
          description: "Die Projekte konnten nicht geladen werden.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, [refreshCounter, showErrorToast]); // Depend on refreshCounter

  // Load projects from Supabase storage
  useEffect(() => {
    console.log(
      "[ProjectsView] useEffect running. projectJustDeleted:",
      projectJustDeleted,
      "toastShownRef:",
      toastShownForDeletion.current
    );
    if (projectJustDeleted && !toastShownForDeletion.current) {
      console.log(
        "[ProjectsView] projectJustDeleted is true AND toast not shown yet. Showing toast..."
      );
      toast.error(`"${deletedProjectTitle || "Projekt"}" wurde gelöscht`, {
        description: `Ihr Projekt wurde erfolgreich gelöscht.`,
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });
      toastShownForDeletion.current = true;
      console.log("[ProjectsView] Set toastShownRef.current = true");

      console.log("[ProjectsView] Resetting projectJustDeleted to false.");
      setProjectJustDeleted(false);
      console.log("[ProjectsView] Resetting deletedProjectTitle to null.");
      setDeletedProjectTitle(null);
    } else if (!projectJustDeleted) {
      if (toastShownForDeletion.current) {
        console.log(
          "[ProjectsView] projectJustDeleted is false. Resetting toastShownRef.current = false."
        );
        toastShownForDeletion.current = false;
      }
    }
  }, [
    projectJustDeleted,
    setProjectJustDeleted,
    deletedProjectTitle,
    setDeletedProjectTitle,
  ]);

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    router.push("/editor");
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  };

  // Combined delete logic (Database + Storage)
  const handleProjectDelete = async (
    projectId: string,
    projectTitle: string
  ) => {
    setIsLoading(true); // Indicate loading state during deletion
    try {
      // Attempt to delete from storage first (might be less critical if DB fails)
      await deleteProjectFromStorage(projectId);
      // Attempt to delete from database
      await deleteProjectFromDatabase(projectId);

      // Show success toast
      toast.error(`"${projectTitle}" wurde gelöscht`, {
        description: `Ihr Projekt wurde erfolgreich gelöscht.`,
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });

      // Trigger refresh after successful deletion
      setRefreshCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting project:", error);
      showErrorToast(
        "Fehler beim Löschen",
        `Das Projekt "${projectTitle}" konnte nicht vollständig gelöscht werden.`
      );
      // Still refresh the list even if deletion failed partially
      setRefreshCounter((prev) => prev + 1);
    } finally {
      // Set loading to false *after* state update from refresh
      // We might need a small delay or better state management here
      // For now, let the loadProjects effect handle setting isLoading to false
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <h1 className="text-3xl font-bold mr-auto">Projekte</h1>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="hidden md:block"
        >
          <TabsList>
            <TabsTrigger value="all">Alle Projekte</TabsTrigger>
            <TabsTrigger value="recent">Kürzlich</TabsTrigger>
            <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-auto md:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Projekte durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreateProject}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Neues Projekt</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </div>

      {/* Tabs for mobile */}
      <div className="md:hidden">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Alle
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Kürzlich
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              Vorlagen
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Project Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Projekte werden geladen...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
              onDelete={() => handleProjectDelete(project.id, project.title)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] xl:pr-[250px]">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">
              Keine Projekte gefunden
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Versuchen Sie einen anderen Suchbegriff"
                : "Erstellen Sie Ihr erstes Projekt, um zu beginnen"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateProject}>Projekt erstellen</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

```

# components/dnd-provider.tsx

```tsx
"use client";

import type { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomDragLayer } from "./canvas/custom-drag-layer"; // Import the custom layer

interface DragAndDropProviderProps {
  children: ReactNode;
}

export function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
      <CustomDragLayer /> {/* Render the custom layer */}
    </DndProvider>
  );
}

```

# components/features.tsx

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Zap, Shield, BarChart, Globe } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Reduced to 4 key features
const features = [
  {
    icon: Zap,
    title: "Blitzschnell",
    description:
      "Unsere optimierte Plattform sorgt dafür, dass deine Anwendung mit minimaler Latenz auf Höchstleistung läuft.",
  },
  {
    icon: Shield,
    title: "Standardmäßig sicher",
    description:
      "Sicherheit auf Unternehmensniveau mit Ende-zu-Ende-Verschlüsselung und fortschrittlichem Bedrohungsschutz.",
  },
  {
    icon: BarChart,
    title: "Detaillierte Analysen",
    description:
      "Gewinne wertvolle Einblicke mit umfassenden Analysen und anpassbaren Dashboards.",
  },
  {
    icon: Globe,
    title: "Globales CDN",
    description:
      "Content-Delivery-Netzwerk sorgt für schnelle Ladezeiten für Nutzer überall auf der Welt.",
  },
];

export default function Features() {
  // Extract icon components
  const ZapIcon = features[0].icon;
  const ShieldIcon = features[1].icon;
  const BarChartIcon = features[2].icon;
  const GlobeIcon = features[3].icon;

  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Funktionen</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Leistungsstarke Funktionen
              </h2>
              <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
                Unsere Plattform ist vollgepackt mit leistungsstarken
                Funktionen, die dir beim Aufbau und Wachstum deiner Anwendung
                helfen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-muted rounded-xl h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <ZapIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[0].title}
                </h3>
                <p className="text-muted-foreground max-w-lg text-base">
                  {features[0].description}
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl aspect-square p-6 flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <ShieldIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[1].title}
                </h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  {features[1].description}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-xl aspect-square p-6 flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <BarChartIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[2].title}
                </h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  {features[2].description}
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex justify-between flex-col relative overflow-hidden group border border-primary/30">
              <GlowingEffect
                disabled={false}
                blur={8}
                spread={20}
                borderWidth={2}
                proximity={100}
                movementDuration={1.5}
                glow={true}
              />
              <GlobeIcon className="w-8 h-8 stroke-1 text-primary" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-medium">
                  {features[3].title}
                </h3>
                <p className="text-muted-foreground max-w-lg text-base">
                  {features[3].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

```

# components/footer.tsx

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
              <span className="font-bold inline-block">AppName</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Wir gestalten die Zukunft von Webanwendungen mit leistungsstarken,
              benutzerfreundlichen Tools.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Produkt</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funktionen
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preise
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dokumentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Änderungsprotokoll
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Unternehmen</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Karriere
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AppName. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Datenschutzerklärung
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Nutzungsbedingungen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

```

# components/hero.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Hero() {
  // State für den Typewriter-Effekt
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const words = useMemo(
    () => ["Großartiges", "Innovatives", "Kreatives", "Einzigartiges"],
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter Animation
  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    const timeout = setTimeout(
      () => {
        if (isWaiting) {
          setIsWaiting(false);
          setIsDeleting(true);
          return;
        }

        if (isDeleting) {
          if (currentText === "") {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % words.length);
          } else {
            setCurrentText((prev) => prev.slice(0, -1));
          }
        } else {
          const targetWord = words[currentIndex];
          if (currentText === targetWord) {
            setIsWaiting(true);
          } else {
            setCurrentText((prev) => targetWord.slice(0, prev.length + 1));
          }
        }
      },
      isWaiting ? pauseDuration : isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, isWaiting, words]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#c7ed85]/20 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/20 via-secondary/20 to-background blur-3xl opacity-50 -z-10" />

      <div className="container relative">
        <div className="flex flex-col items-center text-center max-w-8xl mx-auto space-y-8">
          <h1 className="text-9xl md:text-9xl font-black tracking-tight leading-tight">
            Baue heute etwas <br />
            <span className="text-[#D4A373] inline-flex">
              {currentText}
              <span
                className="ml-1 inline-block h-[1em] w-[2px] animate-text-blink bg-[#D4A373]"
                aria-hidden="true"
              />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Unsere Plattform bietet alles, was du brauchst, um deine nächste
            große Idee zu erstellen, zu starten und zu skalieren. Beginne mit
            Zuversicht zu bauen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="gap-2">
              Jetzt starten <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Mehr erfahren
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 w-full">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">10k+</span>
              <span className="text-muted-foreground">Aktive Nutzer</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">99,9%</span>
              <span className="text-muted-foreground">Verfügbarkeit</span>
            </div>
            <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <span className="text-3xl font-bold">24/7</span>
              <span className="text-muted-foreground">Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

```

# components/layout/dashboard-sidebar.tsx

```tsx
"use client";

import React from "react"; // Removed useState import
import { useRouter } from "next/navigation";
import { Home, Library, BarChart3, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Removed DropdownMenu*, ProfileSheet, SettingsSheet imports

// Define the type for the view state setter function including new views
type SetActiveView = React.Dispatch<
  React.SetStateAction<
    "projects" | "mediathek" | "analytics" | "profile" | "settings"
  >
>;

interface DashboardSidebarProps {
  activeView: "projects" | "mediathek" | "analytics" | "profile" | "settings"; // Updated activeView type
  setActiveView: SetActiveView;
}

export default function DashboardSidebar({
  activeView,
  setActiveView,
}: DashboardSidebarProps) {
  const router = useRouter();
  const { user, supabase } = useSupabase();
  // Removed isProfileOpen, isSettingsOpen state

  // Explicitly type the navItems array
  const navItems: {
    name: string;
    view: "projects" | "mediathek" | "analytics";
    icon: React.ElementType;
  }[] = [
    { name: "Projekte", view: "projects", icon: Home },
    { name: "Mediathek", view: "mediathek", icon: Library },
    { name: "Analytics", view: "analytics", icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r bg-background fixed left-0 top-0 pt-[73px] z-40">
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activeView === item.view ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeView === item.view && "font-semibold"
            )}
            onClick={() => setActiveView(item.view)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t space-y-2">
        {user ? (
          <>
            <Button
              variant={activeView === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
            <Button
              variant={activeView === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 mt-2 pt-2 pb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none truncate max-w-[150px]">
                  {user.email?.split("@")[0]}
                </span>
                <span className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Anmelden
          </Button>
        )}
      </div>
    </aside>
  );
}

```

# components/layout/editor-right-sidebar.tsx

```tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Updated MediaItem interface to match our database schema
interface MediaItem {
  id: string;
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
}

interface MediaCategoryProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: MediaItem[];
  type: string;
  isActive: boolean;
  onSelect: () => void;
}

function MediaCategory({
  title,
  icon,
  iconColor,
  items,
  type,
  isActive,
  onSelect,
}: MediaCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, 4);

  const renderItem = (item: MediaItem) => {
    // Check if the file type starts with image/
    if (item.file_type.startsWith("image/")) {
      return (
        <div
          key={item.id}
          className="aspect-square bg-muted rounded-lg p-2 hover:bg-muted/80 cursor-pointer group relative"
        >
          <div className="w-full h-full bg-background rounded overflow-hidden">
            <Image
              src={item.url}
              alt={item.file_name}
              width={item.width || 100}
              height={item.height || 100}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white truncate">{item.file_name}</p>
          </div>
        </div>
      );
    }

    // For non-image files, determine the icon based on file type
    const icon = (() => {
      if (item.file_type.startsWith("video/")) {
        return <Film className="w-6 h-6" />;
      } else if (item.file_type.startsWith("audio/")) {
        return <Music className="w-6 h-6" />;
      } else {
        return <FileText className="w-6 h-6" />;
      }
    })();

    return (
      <div
        key={item.id}
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{item.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {(item.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      </div>
    );
  };

  const handleHeaderClick = () => {
    if (!isActive) {
      onSelect();
      setIsExpanded(false);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={handleHeaderClick}
        className={`w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
          isActive ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground ml-2">
            ({items.length})
          </span>
        </div>
        {isActive && items.length > 4 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {!isExpanded && <span>{items.length - 4} weitere</span>}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>
      {isActive && (
        <div className="px-3 pb-3">
          {type === "image" ? (
            <div className="grid grid-cols-2 gap-2">
              {displayItems
                .filter((item) => item.file_type.startsWith("image/"))
                .map(renderItem)}
            </div>
          ) : (
            <div className="space-y-2">
              {displayItems
                .filter((item) => {
                  switch (type) {
                    case "video":
                      return item.file_type.startsWith("video/");
                    case "audio":
                      return item.file_type.startsWith("audio/");
                    case "document":
                      return (
                        !item.file_type.startsWith("image/") &&
                        !item.file_type.startsWith("video/") &&
                        !item.file_type.startsWith("audio/")
                      );
                    default:
                      return false;
                  }
                })
                .map(renderItem)}
            </div>
          )}
          {items.length > 4 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full mt-2 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Mehr anzeigen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// MediaLibraryContent component to handle media items and uploads
export function MediaLibraryContent() {
  const { user, supabase, session } = useSupabase();
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("image");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();

  // Fetch media items from Supabase and set up real-time subscription
  useEffect(() => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    async function fetchMediaItems() {
      if (!supabase || !user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Fehler beim Laden der Medien");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMediaItems();

    // Set up real-time subscription
    const channel = supabase
      .channel("media_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes
          schema: "public",
          table: "media_items",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Real-time update received:", payload);

          // Refresh the entire list to ensure consistency
          const { data, error } = await supabase
            .from("media_items")
            .select("*")
            .eq("user_id", user.id)
            .order("uploaded_at", { ascending: false });

          if (!error && data) {
            setMediaItems(data);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [supabase, user]);

  // Check for session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    if (!user || !supabase) {
      toast.error("Sie müssen angemeldet sein, um Medien hochzuladen");
      router.push("/auth/login");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of files) {
      try {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} ist zu groß (Max: 50MB)`);
          continue;
        }

        const bucket = getBucketForFile(file);
        const filePath = `${user.id}/${Date.now()}-${file.name}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (!data?.publicUrl) throw new Error("Could not get public URL");

        // Get dimensions if it's an image
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({
                width: img.width,
                height: img.height,
              });
            };
            img.onerror = () => {
              resolve({ width: 0, height: 0 });
            };
            img.src = data.publicUrl;
          }
        );

        // Add to media_items table
        const { error: dbError } = await supabase.from("media_items").insert({
          id: uuidv4(),
          file_name: file.name,
          file_type: file.type,
          url: data.publicUrl,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          user_id: user.id,
          uploaded_at: new Date().toISOString(),
        });

        if (dbError) throw dbError;

        toast.success(`${file.name} erfolgreich hochgeladen`);
        setUploadProgress((prev) => prev + 100 / files.length);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Fehler beim Hochladen von ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <MediaCategory
              title="Bilder"
              icon={<ImageIcon />}
              iconColor="text-blue-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("image/")
              )}
              type="image"
              isActive={activeCategory === "image"}
              onSelect={() => setActiveCategory("image")}
            />
            <MediaCategory
              title="Videos"
              icon={<Film />}
              iconColor="text-red-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("video/")
              )}
              type="video"
              isActive={activeCategory === "video"}
              onSelect={() => setActiveCategory("video")}
            />
            <MediaCategory
              title="Audio"
              icon={<Music />}
              iconColor="text-purple-500"
              items={mediaItems.filter((item) =>
                item.file_type.startsWith("audio/")
              )}
              type="audio"
              isActive={activeCategory === "audio"}
              onSelect={() => setActiveCategory("audio")}
            />
            <MediaCategory
              title="Dokumente"
              icon={<FileText />}
              iconColor="text-green-500"
              items={mediaItems.filter(
                (item) =>
                  !item.file_type.startsWith("image/") &&
                  !item.file_type.startsWith("video/") &&
                  !item.file_type.startsWith("audio/")
              )}
              type="document"
              isActive={activeCategory === "document"}
              onSelect={() => setActiveCategory("document")}
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex flex-col gap-4">
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                handleFileUpload(files);
              }
            }}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragging
                    ? "Dateien hier ablegen"
                    : "Klicken zum Hochladen"}
                </p>
                <p className="text-sm text-muted-foreground">
                  oder Dateien hier reinziehen
                </p>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Upload läuft... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// EditorRightSidebar component to handle the right sidebar in the editor
export function EditorRightSidebar() {
  const [activeTab, setActiveTab] = useState<"media" | "properties">("media");

  return (
    <div className="w-[300px] bg-background border-l border-border flex flex-col h-full">
      <div className="pt-16 border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "media"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mediathek
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "properties"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Eigenschaften
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === "media" ? (
          <MediaLibraryContent />
        ) : (
          <div className="text-center text-muted-foreground p-4">
            Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.
          </div>
        )}
      </div>
    </div>
  );
}

// ... rest of the file (PropertiesPanelContent and EditorRightSidebar) stays the same ...

```

# components/layout/left-sidebar.tsx

```tsx
"use client";

import { DraggableBlock } from "@/components/blocks/draggable-block";
import {
  Heading,
  PenLineIcon as ParagraphIcon,
  ImageIcon,
  BoxIcon as ButtonIcon,
  FormInput,
  SeparatorHorizontal,
} from "lucide-react";

// Define the available block types with icons
const blockTypes = [
  {
    type: "heading",
    content: "Überschrift",
    icon: Heading,
    description: "Füge eine Überschrift hinzu",
  },
  {
    type: "paragraph",
    content: "Absatz",
    icon: ParagraphIcon,
    description: "Füge einen Textabsatz hinzu",
  },
  {
    type: "image",
    content: null,
    icon: ImageIcon,
    description: "Füge ein Bild ein",
  },
  {
    type: "button",
    content: "Schaltfläche",
    icon: ButtonIcon,
    description: "Füge eine klickbare Schaltfläche hinzu",
  },
  {
    type: "form",
    content: "Formular",
    icon: FormInput,
    description: "Erstelle ein Formularelement",
  },
  {
    type: "divider",
    content: "Trennlinie",
    icon: SeparatorHorizontal,
    description: "Füge eine horizontale Trennlinie hinzu",
  },
];

export default function LeftSidebar() {
  return (
    <div className="w-64 bg-card border-r border-border overflow-y-auto p-5 pt-24">
      <h2 className="text-lg font-semibold mb-5">Blöcke</h2>
      <div className="grid grid-cols-2 gap-3">
        {blockTypes.map((block) => (
          <DraggableBlock
            key={block.type}
            type={block.type}
            content={block.content}
            icon={block.icon}
            description={block.description}
          />
        ))}
      </div>
    </div>
  );
}

```

# components/layout/navbar.tsx

```tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PencilRuler,
  LogIn,
  ChevronLeft,
  Save,
  User,
  Settings,
  LogOut,
  Check,
  ToggleLeft,
  ToggleRight,
  Share,
  Download,
  Trash,
} from "lucide-react";
import { useBlocksStore } from "@/store/blocks-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deleteProjectFromDatabase } from "@/lib/supabase/database";
import { deleteProjectFromStorage } from "@/lib/supabase/storage";

interface NavbarProps {
  currentView?: "dashboard" | "editor" | "mediathek";
  projectTitle?: string;
  onTitleChange?: (title: string) => void;
}

export default function Navbar({
  currentView = "dashboard",
  projectTitle = "Untitled Project",
  onTitleChange,
}: NavbarProps) {
  const router = useRouter();
  const {
    saveProject,
    isSaving,
    autoSaveEnabled,
    toggleAutoSave,
    lastSaved,
    currentProjectId,
    setProjectJustDeleted,
    setDeletedProjectTitle,
  } = useBlocksStore();
  const { user, supabase } = useSupabase();
  const [title, setTitle] = useState(projectTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showLastSaved, setShowLastSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update title when projectTitle prop changes
  useEffect(() => {
    setTitle(projectTitle);
  }, [projectTitle]);

  // Effect to handle the last saved indicator animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lastSaved) {
      setShowLastSaved(true);
      timer = setTimeout(() => {
        setShowLastSaved(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [lastSaved]);

  // Effect to handle error display
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Check authentication status before saving
      if (!user) {
        setSaveStatus("error");
        setError("Authentication required to save. Please sign in.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }

      const success = await saveProject(title);
      if (success) {
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setError(
          "Failed to save project. Please check your connection and permissions."
        );
        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error: unknown) {
      setSaveStatus("error");
      setError(error instanceof Error ? error.message : "Error saving project");
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onTitleChange) {
        onTitleChange(title);
      }
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId) {
      setError("No project selected to delete.");
      return;
    }
    try {
      // Remember the title *before* deleting
      const titleToDelete = title;

      // Lösche den Projektdatensatz aus der Datenbank
      const dbDeleted = await deleteProjectFromDatabase(currentProjectId);
      // Lösche die zugehörigen Dateien aus dem Storage
      const storageDeleted = await deleteProjectFromStorage(currentProjectId);

      if (dbDeleted || storageDeleted) {
        // Speichere den Titel im Store
        console.log("[Navbar] Setting deletedProjectTitle:", titleToDelete);
        setDeletedProjectTitle(titleToDelete);

        // Setze das Flag im Store
        console.log(
          "[Navbar] Deletion successful. Setting projectJustDeleted=true"
        );
        setProjectJustDeleted(true);
        // Navigiere zum Dashboard ohne Query-Parameter
        console.log("[Navbar] Redirecting to /dashboard");
        router.replace("/dashboard");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Error deleting project"
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[73px] border-b bg-background z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo and title section */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <PencilRuler className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">Block Builder</h1>
          </div>

          {/* Navigation links - different based on view */}
          {currentView === "dashboard" ? null : currentView === "editor" ? ( // Removed Mediathek link for dashboard view
            <div className="flex items-center ml-8 space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
              {/* Mediathek link removed for editor view */}
              <div className="h-4 border-r border-border"></div>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="h-9 w-48 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <div
                  className="h-9 px-3 flex items-center text-sm font-medium cursor-pointer hover:bg-muted rounded-md"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center ml-8 space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
              <div className="h-4 border-r border-border"></div>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="h-9 w-48 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <div
                  className="h-9 px-3 flex items-center text-sm font-medium cursor-pointer hover:bg-muted rounded-md"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side actions - different based on view */}
        <div className="flex items-center space-x-4">
          {currentView === "editor" && (
            <>
              {/* Last saved indicator and Auto-save group */}
              <div className="flex items-center gap-2">
                {/* Auto-save toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAutoSave(!autoSaveEnabled)}
                  className="flex items-center gap-1 text-xs relative"
                  title={
                    autoSaveEnabled
                      ? "Automatisches Speichern ist aktiviert"
                      : "Automatisches Speichern ist deaktiviert"
                  }
                >
                  {/* Last saved indicator */}
                  <div className="absolute right-full h-8 flex items-center">
                    <div
                      className={`
                        transform transition-all duration-300 ease-in-out mr-4
                        ${
                          showLastSaved
                            ? "translate-x-0 opacity-100"
                            : "translate-x-4 opacity-0 pointer-events-none"
                        }
                      `}
                    >
                      {lastSaved && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          Zuletzt gespeichert:{" "}
                          {new Date(lastSaved).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {autoSaveEnabled ? (
                    <>
                      <ToggleRight className="h-4 w-4 text-green-500" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Manual save button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1 ${
                  saveStatus === "saving"
                    ? "text-orange-500"
                    : saveStatus === "saved"
                    ? "text-green-500"
                    : saveStatus === "error"
                    ? "text-red-500"
                    : ""
                }`}
              >
                {saveStatus === "saving" ? (
                  <Save className="h-4 w-4 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <Check className="h-4 w-4" />
                ) : saveStatus === "error" ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {saveStatus === "saving"
                    ? "Speichern..."
                    : saveStatus === "saved"
                    ? "Gespeichert"
                    : saveStatus === "error"
                    ? "Fehler"
                    : "Speichern"}
                </span>
              </Button>

              {/* Share button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline">Teilen</span>
              </Button>

              {/* Export button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportieren</span>
              </Button>

              {/* Delete button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteProject}
                className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
                <span className="hidden sm:inline">Löschen</span>
              </Button>
            </>
          )}

          {/* User menu / Login Button - Conditionally render based on currentView and user status */}
          {user
            ? // Show User Menu only if NOT on dashboard AND NOT on editor
              currentView !== "dashboard" &&
              currentView !== "editor" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard?view=profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard?view=settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Einstellungen</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Abmelden</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            : // Show Login Button only if NOT on dashboard AND NOT on editor
              currentView !== "dashboard" &&
              currentView !== "editor" && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center gap-1"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    <span>Anmelden</span>
                  </Link>
                </Button>
              )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
    </nav>
  );
}

```

# components/mediathek/mediathek-view.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  Image as LucideImage,
  Video,
  Music,
  FileText,
  Search,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";

// Updated MediaItem type to match our database schema exactly
interface MediaItem {
  id: string; // UUID stored as string in TypeScript
  file_name: string;
  file_type: string;
  url: string;
  uploaded_at: string | null; // timestamp with time zone can be null
  size: number;
  width: number | null;
  height: number | null;
  user_id: string | null; // UUID stored as string in TypeScript
}

export default function MediathekView() {
  const { user, supabase, session } = useSupabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const router = useRouter();

  console.log("MediathekView rendered:", {
    hasUser: !!user,
    userId: user?.id,
    hasSession: !!session,
    hasSupabase: !!supabase,
    timestamp: new Date().toISOString(),
  });

  // Fetch media items from Supabase
  useEffect(() => {
    async function fetchMediaItems() {
      if (!supabase || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Fehler beim Laden der Medien");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMediaItems();
  }, [user, supabase]);

  // Redirect if no session
  useEffect(() => {
    if (!session && !isLoading) {
      router.push("/auth/login");
    }
  }, [session, isLoading, router]);

  // Filter media based on search query
  const filteredMedia = mediaItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group media items by type
  const groupedMedia = mediaItems.reduce((acc, item) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Render media preview with actual image URLs
  const renderMediaPreview = (item: MediaItem) => {
    const type = item.file_type.startsWith("image/")
      ? "image"
      : item.file_type.startsWith("video/")
      ? "video"
      : item.file_type.startsWith("audio/")
      ? "audio"
      : "document";

    const isDeleting = deletingItemId === item.id;

    const DeleteButton = () => (
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => handleDelete(item)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    );

    switch (type) {
      case "image":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <Image
              src={item.url}
              alt={item.file_name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <DeleteButton />
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "audio":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      case "document":
        return (
          <div className="relative aspect-square bg-muted rounded-[30px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <DeleteButton />
          </div>
        );
      default:
        return null;
    }
  };

  // Render-Funktion für eine Medienkategorie
  const renderMediaCategory = (
    type: string,
    title: string,
    icon: React.ReactNode
  ) => {
    const items = groupedMedia[type] || [];
    if (items.length === 0) return null;

    const displayItems = items.slice(0, 4);
    const hasMore = items.length > 4;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="relative group">
              {renderMediaPreview(item)}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[30px]">
                <p className="pl-4 text-sm truncate">{item.file_name}</p>
                <p className="pl-4 text-xs opacity-75">
                  {(item.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
          {hasMore && (
            <Button
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              mehr
            </Button>
          )}
        </div>
      </section>
    );
  };

  // Helper function to determine the appropriate bucket based on file type
  const getBucketForFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "images";
    if (file.type.startsWith("video/")) return "videos";
    if (file.type.startsWith("audio/")) return "audio";
    return "documents";
  };

  // Helper function to get file dimensions (for images)
  const getImageDimensions = async (
    file: File
  ): Promise<{ width: number; height: number }> => {
    if (!file.type.startsWith("image/")) {
      return { width: 0, height: 0 };
    }

    return new Promise((resolve) => {
      const img = new (window.Image as { new (): HTMLImageElement })();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // --- NEU: Hilfsfunktion zum Bereinigen von Dateinamen ---
  const sanitizeFilename = (filename: string): string => {
    // Umlaute und ß ersetzen
    const umlautMap: { [key: string]: string } = {
      ä: "ae",
      ö: "oe",
      ü: "ue",
      Ä: "Ae",
      Ö: "Oe",
      Ü: "Ue",
      ß: "ss",
    };
    let sanitized = filename;
    for (const key in umlautMap) {
      sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
    }

    // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
    return sanitized
      .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
      .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      if (!user || !session || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Dateien hochzuladen");
        router.push("/auth/login");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      for (const file of Array.from(files)) {
        try {
          // Check file size (50MB limit)
          if (file.size > 50 * 1024 * 1024) {
            toast.error(`${file.name} ist zu groß (Max: 50MB)`);
            continue;
          }

          const bucket = getBucketForFile(file);
          // --- MODIFIZIERT: Dateinamen bereinigen ---
          const sanitizedFileName = sanitizeFilename(file.name);
          const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;

          console.log(`Uploading to bucket: ${bucket}, path: ${filePath}`); // Logging hinzugefügt

          // Upload file to storage with proper caching and content type
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: "3600",
              contentType: file.type,
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(filePath);

          // Get dimensions if it's an image
          const dimensions = await getImageDimensions(file);

          // Prepare the media item data (use original file.name for display)
          const mediaItem: MediaItem = {
            id: uuidv4(),
            file_name: file.name, // Originalnamen für die DB/Anzeige beibehalten
            file_type: file.type,
            url: publicUrl,
            size: file.size,
            width: dimensions.width || null,
            height: dimensions.height || null,
            user_id: user.id,
            uploaded_at: new Date().toISOString(),
          };

          // Insert into media_items table
          const { error: dbError } = await supabase
            .from("media_items")
            .insert(mediaItem)
            .select()
            .single();

          if (dbError) {
            console.error("Database error:", dbError);
            // Clean up the uploaded file if database insert fails
            await supabase.storage.from(bucket).remove([filePath]);
            throw dbError;
          }

          // Update local state
          setMediaItems((prev) => [mediaItem, ...prev]);
          toast.success(`${file.name} erfolgreich hochgeladen`);
          setUploadProgress((prev) => prev + 100 / files.length);
        } catch (error) {
          console.error(`File processing error for ${file.name}:`, error);
          toast.error(`Fehler beim Hochladen von ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  // Helper function to get file path from URL
  const getFilePathFromUrl = (url: string): string => {
    try {
      // Extract everything after /public/[bucket]/
      const matches = url.match(/\/public\/[^/]+\/(.+)$/);
      if (!matches || !matches[1]) {
        throw new Error("Invalid URL format");
      }
      return decodeURIComponent(matches[1]);
    } catch (error) {
      console.error("Error parsing URL:", error);
      throw new Error("Could not extract file path from URL");
    }
  };

  // Update the handleDelete function
  const handleDelete = async (item: MediaItem) => {
    try {
      if (!user || !supabase) {
        toast.error("Sie müssen angemeldet sein, um Medien zu löschen");
        return;
      }

      setDeletingItemId(item.id);

      // Determine bucket based on file type
      const bucket = getBucketForFile({ type: item.file_type } as File);
      const filePath = getFilePathFromUrl(item.url);

      console.log("Starting deletion process for:", {
        id: item.id,
        bucket,
        filePath,
        url: item.url,
        userId: user.id,
      });

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        throw storageError;
      }

      console.log(
        "Successfully deleted from storage, now deleting from database..."
      );

      // Delete from database with user_id check for security
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .match({
          id: item.id,
          user_id: user.id,
        });

      if (dbError) {
        console.error("Database delete error:", dbError);
        throw dbError;
      }

      // Update local state
      setMediaItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.error(`${item.file_name} wurde gelöscht`, {
        description: "Die Datei wurde erfolgreich gelöscht.",
        style: {
          backgroundColor: "hsl(var(--destructive))",
          color: "white",
        },
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Fehler beim Löschen von ${item.file_name}`);
    } finally {
      setDeletingItemId(null);
    }
  };

  // Gemeinsame JSX-Elemente für beide Dropzone-Varianten
  const UploadIconContent = () => (
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
      <Upload className="h-6 w-6 text-primary" />
    </div>
  );

  const UploadingIndicator = () => (
    <>
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        </div>
      )}
    </>
  );

  // Hidden File Input (needed for both dropzones)
  const HiddenFileInput = () => (
    <input
      id="file-upload" // ID muss konsistent sein für das Label
      type="file"
      multiple
      className="hidden"
      onChange={handleFileInputChange}
      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
    />
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mediathek</h1>
        <div className="relative w-full max-w-md ml-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Medien durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Linke Spalte: Medienkategorien */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Render categories only if there are items, otherwise the dropzone shows */}

              {mediaItems.length > 0 && (
                <>
                  {renderMediaCategory(
                    "image",
                    "Bilder",
                    <LucideImage className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "video",
                    "Videos",
                    <Video className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "audio",
                    "Audio",
                    <Music className="h-5 w-5" />
                  )}
                  {renderMediaCategory(
                    "document",
                    "Dokumente",
                    <FileText className="h-5 w-5" />
                  )}
                  {/* Display message if no media matches search AND library is not empty */}
                  {filteredMedia.length === 0 && !isLoading && (
                    <p className="text-muted-foreground text-center py-4">
                      Keine Medien für Ihre Suche gefunden.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verstecktes Datei-Input-Feld für beide Dropzone-Typen */}
      <HiddenFileInput />

      {/* Konditionale Anzeige der Dropzone */}
      {mediaItems.length === 0 && !isLoading ? (
        // 1. Große Dropzone, wenn Mediathek leer ist
        <div className="mt-12 w-full">
          <div
            className={`
                  relative border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  transition-colors duration-200 h-[75vH] bg-gray-50/80
                  ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }
                `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIconContent />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Dateien hierher ziehen oder
              </p>
              <label htmlFor="file-upload">
                <Button variant="link" className="mt-1" asChild>
                  <span>Dateien auswählen</span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximale Dateigröße: 50MB
            </p>
            <UploadingIndicator />
          </div>
        </div>
      ) : mediaItems.length > 0 && !isLoading ? (
        // 2. Kleine, fixierte Dropzone, wenn Mediathek NICHT leer ist
        <label htmlFor="file-upload">
          {" "}
          {/* Label umschließt Button für Klickbarkeit */}
          <div
            className={`
              fixed bottom-8 right-8 z-50
              w-48 h-48 border-2 border-dashed rounded-xl {/* Größe und Ecken angepasst */}
              flex items-center justify-center
              cursor-pointer transition-all duration-200
              hover:scale-105 hover:border-primary hover:bg-primary/10 {/* Leicht veränderte Hover-Skalierung */}
              ${
                isDragging
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border bg-background/80 backdrop-blur-sm"
              } {/* Leicht veränderte Drag-Skalierung */}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            title="Dateien hochladen" // Tooltip
          >
            {/* Vereinfachter Inhalt für kleine Dropzone */}
            <Upload
              className={`h-8 w-8 transition-colors ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <UploadingIndicator />
          </div>
        </label>
      ) : null}
    </>
  );
}

```

# components/navbar.tsx

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const { supabase, user, isLoading } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
            <span className="font-bold inline-block">Block Builder</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Funktionen
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Preise
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Über uns
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex gap-4">
          {isLoading ? (
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleDashboardClick}>
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Anmelden</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Registrieren</Button>
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü umschalten</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Funktionen
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Preise
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Über uns
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                {isLoading ? (
                  <div className="h-9 w-full bg-muted rounded-md animate-pulse"></div>
                ) : user ? (
                  <>
                    <Button onClick={handleDashboardClick}>Dashboard</Button>
                    <Button variant="outline" onClick={handleSignOut}>
                      Abmelden
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button variant="outline" className="w-full">
                        Anmelden
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="w-full">Registrieren</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

```

# components/preview/preview-block.tsx

```tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import type { BlockType } from "@/lib/types";
import { getBlockStyle } from "@/lib/utils/block-utils";

interface PreviewBlockProps {
  block: BlockType;
  viewport: "mobile" | "tablet" | "desktop";
}

export function PreviewBlock({ block, viewport }: PreviewBlockProps) {
  const blockStyle = getBlockStyle(block, viewport);

  // Helper function to render the appropriate heading tag
  const renderHeadingContent = () => {
    const level = block.headingLevel || 1;
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <HeadingTag
        className={`m-0 preview-content ${textSizeClass}`}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  };

  // Helper function to render paragraph content with HTML
  const renderParagraphContent = () => {
    const textSizeClass =
      viewport === "mobile"
        ? "text-base"
        : viewport === "tablet"
        ? "text-lg"
        : "text-xl";

    return (
      <div
        className={`preview-content ${textSizeClass}`}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  };

  // Conditionally render wrapper for non-image blocks
  if (block.type === "image") {
    // Render only the image for image blocks, without the wrapper div
    return (
      <img
        src={block.content} // Use block content as image URL
        alt={block.altText || ""} // Use altText or empty string
        className="block w-full h-auto rounded-lg object-cover" // Basic styling, ensure it fills container if needed
        loading="lazy" // Add lazy loading
      />
    );
  }

  // For other block types, render with the wrapper div
  return (
    <div
      className={`${blockStyle} p-4 bg-background border rounded-lg shadow-sm ${
        viewport === "mobile" ? "text-sm" : ""
      }`}
    >
      {block.type === "heading" ? (
        renderHeadingContent()
      ) : block.type === "paragraph" ? (
        renderParagraphContent()
      ) : // --- NEU: Spezifische Behandlung für Audio-Blöcke ---
      block.type === "audio" ? (
        <audio
          src={block.content}
          controls
          className="w-full"
          preload="metadata" // Lade Metadaten (wie Dauer) vorab
        />
      ) : // --- NEU: Spezifische Behandlung für Video-Blöcke ---
      block.type === "video" ? (
        <video
          src={block.content}
          controls
          className="w-full rounded-md" // rounded-md für Konsistenz mit VideoBlock
          preload="metadata"
        />
      ) : // --- NEU: Spezifische Behandlung für Dokument-Blöcke ---
      block.type === "document" ? (
        block.thumbnailUrl ? (
          // Wenn ein Vorschaubild vorhanden ist, zeige es an und verlinke es
          <a href={block.content} target="_blank" rel="noopener noreferrer">
            <img
              src={block.thumbnailUrl}
              alt={`Preview of ${block.fileName || "document"}`}
              className="block w-full h-auto rounded-lg object-contain border border-gray-200" // object-contain, damit ganze Seite sichtbar ist
              loading="lazy"
            />
          </a>
        ) : (
          // Wenn kein Vorschaubild vorhanden ist, zeige den Link wie bisher
          <a
            href={block.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-2"
          >
            {/* Optional: Icon hinzufügen, muss aber importiert werden */}
            {/* <FileText className="h-5 w-5 flex-shrink-0" /> */}
            <span>
              {block.fileName || block.content.split("/").pop() || "Document"}
            </span>
          </a>
        )
      ) : (
        // Default rendering for other types (if any)
        <div className="preview-content">{block.content}</div>
      )}
    </div>
  );
}

```

# components/preview/preview-drop-area.tsx

```tsx
"use client";

import type { DropAreaType } from "@/lib/types";
import { PreviewBlock } from "./preview-block";

interface PreviewDropAreaProps {
  dropArea: DropAreaType;
  viewport: string;
}

export function PreviewDropArea({ dropArea, viewport }: PreviewDropAreaProps) {
  // Skip empty drop areas in preview mode
  if (dropArea.blocks.length === 0 && !dropArea.isSplit) {
    return null;
  }

  // For mobile viewport, always stack vertically
  if (
    viewport === "mobile" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full space-y-4">
        <PreviewDropArea
          dropArea={dropArea.splitAreas[0]}
          viewport={viewport}
        />
        <PreviewDropArea
          dropArea={dropArea.splitAreas[1]}
          viewport={viewport}
        />
      </div>
    );
  }

  // For tablet viewport with 2x2 grid layout
  if (
    viewport === "tablet" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    // Check if this is a second-level split (creating a 2x2 grid)
    if (dropArea.splitAreas.some((area) => area.isSplit)) {
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Render the first split area */}
          {dropArea.splitAreas[0].isSplit ? (
            <>
              <PreviewDropArea
                dropArea={dropArea.splitAreas[0].splitAreas[0]}
                viewport={viewport}
              />
              <PreviewDropArea
                dropArea={dropArea.splitAreas[0].splitAreas[1]}
                viewport={viewport}
              />
            </>
          ) : (
            <PreviewDropArea
              dropArea={dropArea.splitAreas[0]}
              viewport={viewport}
            />
          )}

          {/* Render the second split area */}
          {dropArea.splitAreas[1].isSplit ? (
            <>
              <PreviewDropArea
                dropArea={dropArea.splitAreas[1].splitAreas[0]}
                viewport={viewport}
              />
              <PreviewDropArea
                dropArea={dropArea.splitAreas[1].splitAreas[1]}
                viewport={viewport}
              />
            </>
          ) : (
            <PreviewDropArea
              dropArea={dropArea.splitAreas[1]}
              viewport={viewport}
            />
          )}
        </div>
      );
    }

    // First-level split for tablet - side by side
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <PreviewDropArea
            dropArea={dropArea.splitAreas[0]}
            viewport={viewport}
          />
        </div>
        <div className="flex-1">
          <PreviewDropArea
            dropArea={dropArea.splitAreas[1]}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  // For desktop with up to 4-in-a-row layout
  if (
    viewport === "desktop" &&
    dropArea.isSplit &&
    dropArea.splitAreas.length === 2
  ) {
    return (
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <PreviewDropArea
            dropArea={dropArea.splitAreas[0]}
            viewport={viewport}
          />
        </div>
        <div className="flex-1">
          <PreviewDropArea
            dropArea={dropArea.splitAreas[1]}
            viewport={viewport}
          />
        </div>
      </div>
    );
  }

  // Render blocks in this drop area
  return dropArea.blocks.length > 0 ? (
    <div className="space-y-4">
      {dropArea.blocks.map((block) => (
        <PreviewBlock key={block.id} block={block} viewport={viewport} />
      ))}
    </div>
  ) : null;
}

```

# components/preview/preview.tsx

```tsx
"use client";

import { useState, useEffect } from "react"; // Added hooks
import { useBlocksStore } from "@/store/blocks-store";
import { useViewport } from "@/lib/hooks/use-viewport";
import { PreviewDropArea } from "./preview-drop-area";
// Removed getViewportStyles import
import { filterNonEmptyDropAreas } from "@/lib/utils/drop-area-utils";
// Removed PhoneMockup and TabletMockup imports
import { Signal, Wifi, Battery } from "lucide-react"; // Added icons

export default function Preview() {
  const { dropAreas } = useBlocksStore();
  const { viewport } = useViewport();
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Filter out empty drop areas for preview
  const nonEmptyDropAreas = filterNonEmptyDropAreas(dropAreas);

  // Update time every minute (moved from mockups)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Determine dynamic styles and classes
  const getFrameStyles = () => {
    switch (viewport) {
      case "mobile":
        return {
          width: "min(90vw, 375px)",
          height: "min(calc(90vw * 2.16), 812px)",
        };
      case "tablet":
        return {
          width: "min(95vw, 834px)",
          height: "auto", // Let content determine height
          minHeight: "600px", // Match desktop minHeight
          maxHeight: "85vh", // Update max height constraint to 85vh
        };
      case "desktop":
      default:
        return {
          width: "1400px", // Explicit width instead of 100%
          maxWidth: "1400px", // Keep max width for consistency
          height: "auto", // Let content determine height
          minHeight: "600px", // Ensure a minimum height
        };
    }
  };

  const getFrameClasses = () => {
    let classes =
      "relative bg-white overflow-hidden transition-all duration-300";
    switch (viewport) {
      case "mobile":
        classes += " rounded-[2.5rem] border-[14px] border-black";
        break;
      case "tablet":
        classes += " rounded-[2rem] border-[14px] border-black";
        break;
      case "desktop":
      default:
        classes += " rounded-[2rem] shadow-lg"; // Add shadow for desktop
        break;
    }
    return classes;
  };

  const getContentPadding = () => {
    switch (viewport) {
      case "mobile":
        return "px-4"; // Only horizontal padding needed below status bar
      case "tablet":
        return "p-6";
      case "desktop":
      default:
        return "p-8";
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-6 flex justify-center items-start">
      {/* Single container for frame/screen - now also the flex container */}
      <div
        className={`${getFrameClasses()} flex flex-col`} // Added flex flex-col here
        style={getFrameStyles()}
      >
        {/* Status Bar (Conditional) - Now direct child */}
        {(viewport === "mobile" || viewport === "tablet") && (
          <div
            className={`flex justify-between items-center text-xs font-medium pb-2 bg-gray-700 text-white mb-2 ${
              viewport === "mobile" ? "px-4 py-2" : "px-6 py-2"
            }`}
          >
            <div>{time}</div>
            <div
              className={`flex items-center ${
                viewport === "mobile" ? "gap-1" : "gap-2"
              }`}
            >
              {viewport === "mobile" && <Signal className="w-3.5 h-3.5" />}
              <Wifi
                className={viewport === "mobile" ? "w-3.5 h-3.5" : "w-4 h-4"}
              />
              <Battery
                className={viewport === "mobile" ? "w-4 h-4" : "w-5 h-5"}
                stroke="white" // Weißer Umriss für das Batterie-Icon
                fill="green" // Grüne Füllung für das Batterie-Icon
              />
            </div>
          </div>
        )}

        {/* Content Area - Now direct child */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 relative ${getContentPadding()}`} // Keep scrolling here
        >
          <div
            className={`${viewport === "desktop" ? "space-y-6" : "space-y-4"}`}
          >
            {nonEmptyDropAreas.map((dropArea) => (
              <PreviewDropArea
                key={dropArea.id}
                dropArea={dropArea}
                viewport={viewport}
              />
            ))}
          </div>
        </div>
        {/* Removed intermediate div */}
      </div>
    </div>
  );
}

```

# components/pricing.tsx

```tsx
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Pricing that Scales with You
          </h1>
          <p>
            Gemini is evolving to be more than just the models. It supports an
            entire to the APIs and platforms helping developers and businesses
            innovate.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
          <div className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Free</h2>
                <span className="my-3 block text-2xl font-semibold">
                  $0 / mo
                </span>
                <p className="text-muted-foreground text-sm">Per editor</p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="">Get Started</Link>
              </Button>

              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Basic Analytics Dashboard",
                  "5GB Cloud Storage",
                  "Email and Chat Support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dark:bg-muted rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h2 className="font-medium">Pro</h2>
                  <span className="my-3 block text-2xl font-semibold">
                    $19 / mo
                  </span>
                  <p className="text-muted-foreground text-sm">Per editor</p>
                </div>

                <Button asChild className="w-full">
                  <Link href="">Get Started</Link>
                </Button>
              </div>

              <div>
                <div className="text-sm font-medium">
                  Everything in free plus :
                </div>

                <ul className="mt-4 list-outside space-y-3 text-sm">
                  {[
                    "Everything in Free Plan",
                    "5GB Cloud Storage",
                    "Email and Chat Support",
                    "Access to Community Forum",
                    "Single User Access",
                    "Access to Basic Templates",
                    "Mobile App Access",
                    "1 Custom Report Per Month",
                    "Monthly Product Updates",
                    "Standard Security Features",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

```

# components/profile/profile-view.tsx

```tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Placeholder component for Profile View
export default function ProfileView() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Ihr Name"
              defaultValue="Meister Matthias"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ihre Email"
              defaultValue="meister.matthias86@gmail.com"
              readOnly
            />
          </div>
          <Button>Änderungen speichern</Button>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Aktuelles Passwort</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Neues Passwort</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Passwort ändern</Button>
        </CardContent>
      </Card>
    </div>
  );
}

```

# components/providers/supabase-provider.tsx

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// Define the context type
type SupabaseContextType = {
  supabase: ReturnType<typeof createClient> | undefined;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error?: string;
};

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: undefined,
  session: null,
  user: null,
  isLoading: true,
});

/**
 * Provider component that makes Supabase client available to any child component that calls useSupabase().
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => {
    // Only create the client once on component mount
    if (typeof window !== "undefined") {
      return createClient();
    }
    return undefined;
  });

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Set up auth state listener on mount
  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error: any) {
        setError(error.message || "Error getting initial session");
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    supabase,
    session,
    user,
    isLoading,
    error,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook that provides access to the Supabase client and auth state
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
}

```

# components/settings/settings-view.tsx

```tsx
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Placeholder component for Settings View
export default function SettingsView() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
          <CardDescription>Allgemeine Anwendungseinstellungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="language-select"
              className="flex flex-col space-y-1"
            >
              <span>Sprache</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Wählen Sie Ihre bevorzugte Sprache.
              </span>
            </Label>
            <Select defaultValue="de">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sprache wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="theme-mode" className="flex flex-col space-y-1">
              <span>Theme</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Wählen Sie zwischen hellem und dunklem Modus.
              </span>
            </Label>
            <Select defaultValue="system">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Hell</SelectItem>
                <SelectItem value="dark">Dunkel</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Benachrichtigungseinstellungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="email-notifications"
              className="flex flex-col space-y-1"
            >
              <span>Email Benachrichtigungen</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Erhalten Sie Emails über wichtige Aktivitäten.
              </span>
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="push-notifications"
              className="flex flex-col space-y-1"
            >
              <span>Push Benachrichtigungen</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Erhalten Sie Push-Benachrichtigungen auf Ihren Geräten.
              </span>
            </Label>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}

```

# components/ui/alert-dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

```

# components/ui/alert.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

```

# components/ui/avatar.tsx

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-secondary",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

```

# components/ui/badge.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```

# components/ui/button.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

# components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

# components/ui/dialog.tsx

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

```

# components/ui/dropdown-menu.tsx

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

# components/ui/glowing-effect.tsx

```tsx
"use client";

import type React from "react";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);
    const animationRef = useRef<number | null>(null);

    // Custom animation function to replace motion library
    const animateValue = (
      start: number,
      end: number,
      duration: number,
      callback: (value: number) => void
    ) => {
      const startTime = performance.now();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / (duration * 1000), 1);

        // Cubic bezier approximation for easing
        const t = progress;
        const easedProgress =
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

        const currentValue = start + (end - start) * easedProgress;
        callback(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            Number.parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animateValue(currentAngle, newAngle, movementDuration, (value) => {
            element.style.setProperty("--start", String(value));
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, hsl(var(--primary)) 10%, transparent 20%),
                radial-gradient(circle at 40% 40%, hsl(var(--primary)) 5%, transparent 15%),
                radial-gradient(circle at 60% 60%, hsl(var(--primary)) 10%, transparent 20%),
                radial-gradient(circle at 40% 60%, hsl(var(--primary)) 10%, transparent 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  hsl(var(--primary)) 0%,
                  hsl(var(--primary)) calc(25% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(50% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(75% / var(--repeating-conic-gradient-times)),
                  hsl(var(--primary)) calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)] ",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };

```

# components/ui/input.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

```

# components/ui/label.tsx

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

```

# components/ui/select.tsx

```tsx
"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};

```

# components/ui/sheet.tsx

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

# components/ui/sonner.tsx

```tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

```

# components/ui/switch.tsx

```tsx
"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

```

# components/ui/tabs.tsx

```tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

# components/ui/toast.tsx

```tsx
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

```

# components/ui/toaster.tsx

```tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

```

# components/ui/tooltip.tsx

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

# globals.d.ts

```ts
/* globals.d.ts */

// Diese Datei erweitert das globale Window-Interface um benutzerdefinierte Eigenschaften,
// die in den Standard-Typdefinitionen nicht definiert sind.
// Hier fügen wir die optionale Funktion 'resetDropAreaContentHover' hinzu, die den Hover-Zustand von Drop Areas zurücksetzt.

declare global {
  interface Window {
    // Diese optionale Funktion ermöglicht das Zurücksetzen des Hover-Zustands in Drop Areas.
    resetDropAreaContentHover?: () => void;
  }
}

export {};

```

# hooks/use-toast.ts

```ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```

# lib/constants.ts

```ts
export const ItemTypes = {
  BLOCK: "block",
}


```

# lib/extensions/emoji-extension.tsx

```tsx
import { Extension } from "@tiptap/core";
import { Editor, ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import React, { FC, useCallback, useState, useRef, useEffect } from "react";
import EmojiPicker, {
  EmojiClickData,
  Theme,
  EmojiStyle,
} from "emoji-picker-react";

// Component that renders the emoji picker
const EmojiPickerComponent: FC<{
  editor: Editor;
  onClose: () => void;
}> = ({ editor, onClose }) => {
  // Handle emoji selection
  const handleEmojiSelect = useCallback(
    (emojiData: EmojiClickData) => {
      // Insert the emoji at current cursor position
      editor.commands.insertContent(emojiData.emoji);
      // Close the picker
      onClose();
    },
    [editor, onClose]
  );

  return (
    <div className="emoji-picker-container">
      <EmojiPicker
        onEmojiClick={handleEmojiSelect}
        theme={Theme.AUTO}
        lazyLoadEmojis={true}
        searchPlaceHolder="Emoji suchen..."
        width={300}
        height={350}
        previewConfig={{
          showPreview: true,
          defaultCaption: "Emoji auswählen",
        }}
        skinTonesDisabled
        searchDisabled={false}
        emojiStyle={EmojiStyle.NATIVE}
      />
    </div>
  );
};

// The actual Tiptap extension
const EmojiExtension = Extension.create({
  name: "emojiPicker",
});

export default EmojiExtension;

// Type definition for HTML elements with tippy instance attached
interface TippyNode extends HTMLElement {
  _tippy?: {
    hide: () => void;
    destroy: () => void;
  };
}

// Button component to add to the toolbar
export const EmojiPickerButton: FC<{ editor: Editor }> = ({ editor }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);

  const toggleEmojiPicker = () => {
    if (!buttonRef.current) return;

    if (!isActive) {
      const tippyInstance = tippy(buttonRef.current, {
        content: document.createElement("div"),
        trigger: "manual",
        interactive: true,
        appendTo: document.body,
        placement: "bottom-start",
        animation: "shift-away",
        showOnCreate: true,
        theme: "light-border",
        maxWidth: "none",
        arrow: false,
        offset: [0, 8],
        zIndex: 9999,
        onHide: () => {
          setIsActive(false);
        },
        onDestroy: () => {
          setIsActive(false);
        },
      });

      // Create a div element to render our emoji picker into
      const container = document.createElement("div");
      container.className = "border-0 overflow-hidden";

      // Set up React render
      const reactRenderer = new ReactRenderer(EmojiPickerComponent, {
        props: {
          editor,
          onClose: () => {
            tippyInstance.hide();
            tippyInstance.destroy();
          },
        },
        editor,
      });

      // Set the content to our React component's element
      container.appendChild(reactRenderer.element);
      tippyInstance.setContent(container);

      // Show the tippy instance
      tippyInstance.show();

      // Update state
      setIsActive(true);
    } else {
      // If already active, hide any existing tippy instances on this element
      const button = buttonRef.current as TippyNode;
      if (button._tippy) {
        button._tippy.hide();
        button._tippy.destroy();
      }
      setIsActive(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    // Capture the current value of the ref inside the effect
    const button = buttonRef.current as TippyNode;

    return () => {
      // Use the captured value in cleanup
      if (button?._tippy) {
        button._tippy.destroy();
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={toggleEmojiPicker}
      className={`emoji-picker-button px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
        isActive ? "bg-gray-300" : ""
      }`}
      aria-label="Emoji einfügen"
    >
      😀
    </button>
  );
};

```

# lib/hooks/use-block-drag.ts

```ts
import { useDrag, DragSourceMonitor } from "react-dnd"; // Correctly import only DragSourceMonitor
import { ItemTypes } from "@/lib/item-types";
import type { BlockType } from "@/lib/types";

// Global object to track which blocks are currently being dragged
// This helps prevent duplicate drag operations of the same block
const ActiveDrags = new Map<
  string,
  {
    dropAreaId: string;
    index: number;
    startTime: number;
  }
>();

function isBlockBeingDragged(blockId: string): boolean {
  return ActiveDrags.has(blockId);
}

function trackBlockDrag(
  blockId: string,
  dropAreaId: string,
  index: number
): void {
  ActiveDrags.set(blockId, {
    dropAreaId,
    index,
    startTime: Date.now(),
  });
  // console.log(`[DragTracker] Started tracking drag for block ${blockId} from ${dropAreaId}`); // Keep logs commented out
}

function untrackBlockDrag(blockId: string): void {
  if (ActiveDrags.has(blockId)) {
    // console.log(`[DragTracker] Stopped tracking drag for block ${blockId}`); // Keep logs commented out
    ActiveDrags.delete(blockId);
  }
}

// Define the drag item structure explicitly
interface BlockDragItem {
  id: string;
  type: typeof ItemTypes.EXISTING_BLOCK; // Explicitly set type
  originalType: string; // Store the actual block type
  content: string;
  sourceDropAreaId: string;
  originalIndex: number; // Add original index
  // Add any additional metadata needed for rendering the block preview
  headingLevel?: number; // For heading blocks
}

export const useBlockDrag = (
  block: BlockType,
  index: number, // Add index parameter
  canDrag: boolean = true
) => {
  // Pass spec object directly to useDrag
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EXISTING_BLOCK, // Draggable type
    item: (monitor) => {
      // CRITICAL: Before creating the item, check if this block is already being dragged
      if (isBlockBeingDragged(block.id)) {
        // console.log(`[useBlockDrag] Block ${block.id} is already being dragged! Preventing duplicate drag.`); // Keep logs commented out
        return null;
      }

      // console.log(`[useBlockDrag] Begin drag for block: ${block.id}`); // Keep logs commented out

      // Track that we're starting to drag this block
      trackBlockDrag(block.id, block.dropAreaId, index);

      // Return the item data
      return {
        id: block.id,
        type: ItemTypes.EXISTING_BLOCK, // *** FIX: Set type explicitly ***
        originalType: block.type, // *** ADD: Store original type ***
        content: block.content,
        sourceDropAreaId: block.dropAreaId,
        originalIndex: index, // Include the index
        // Include heading level if present
        ...(block.headingLevel && { headingLevel: block.headingLevel }),
      };
    },
    canDrag: (monitor) => {
      // Don't allow drag if this block is already being dragged
      if (isBlockBeingDragged(block.id)) {
        return false;
      }
      return canDrag;
    },
    collect: (monitor: DragSourceMonitor<BlockDragItem, unknown>) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Log the start of drag in the item function instead of using begin
    // Called when dragging stops
    end: (
      item: BlockDragItem | undefined,
      monitor: DragSourceMonitor<BlockDragItem, any> // *** FIX: Use DragSourceMonitor ***
    ) => {
      const dragId = `drag-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      if (!item) {
        untrackBlockDrag(block.id);
        return;
      }

      // Untrack this block
      untrackBlockDrag(item.id);

      // Dispatch custom event for drag end
      const event = new CustomEvent("dragEnd", {
        detail: { blockId: item.id, dragId },
      });
      window.dispatchEvent(event);

      // If no drop result but drag ended, make sure UI is reset
      if (!monitor.didDrop()) {
        // @ts-ignore - Accessing window property
        const resetFnExists =
          typeof window.resetDropAreaContentHover === "function";
        if (resetFnExists) {
          // @ts-ignore
          window.resetDropAreaContentHover();
        }
      }
    },
  });

  // Return only isDragging and drag
  return { isDragging, drag };
};

```

# lib/hooks/use-drop-area.ts

```ts
"use client";

import { useDrop } from "react-dnd";
import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ItemTypes, markDropHandled } from "@/lib/item-types";
import { useBlocksStore } from "@/store/blocks-store";
// Removed duplicate imports
import type { DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import { findDropAreaById } from "@/lib/utils/drop-area-utils";
import type { DropTargetMonitor } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { useSupabase } from "@/components/providers/supabase-provider";
import { uploadMediaFile, addMediaItemToDatabase } from "@/lib/supabase/storage";
import { toast } from "sonner";

interface DragItem {
  id?: string; // ID of the block being dragged (if existing)
  type: string; // Type of the block (e.g., 'heading', 'paragraph')
  content: string; // Default content for new blocks
  sourceDropAreaId?: string; // Original drop area ID (if moving existing block)
  files?: File[]; // Add files for NativeTypes.FILE
}

export const useDropArea = (dropArea: DropAreaType, viewport: ViewportType) => {
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const { supabase: supabaseClient, user } = useSupabase();

  const {
    addBlock, // Function to add a new block
    moveBlock, // Function to move an existing block
    canSplit, // Function to check if an area can be split
    splitDropArea, // Function to split an empty area
    canMerge, // Function to check if areas can be merged
    mergeDropAreas, // Function to merge areas
    dropAreas, // Current state of all drop areas (used for merge checks)
    // Removed insertDropArea as it's handled by the parent now
  } = useBlocksStore();

  const [isHovering, setIsHovering] = useState(false); // Tracks direct hover over this area
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null); // Track mouse position
  const [dropError, setDropError] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [mergePosition, setMergePosition] = useState<"left" | "right" | "both">(
    "both"
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    { name: string; handled: boolean; dropAreaId: string } | undefined,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [ItemTypes.BLOCK, ItemTypes.SQUARE, ItemTypes.EXISTING_BLOCK, NativeTypes.FILE],

    canDrop: (item: DragItem, monitor) => {
      // Handle file drops
      if (monitor.getItemType() === NativeTypes.FILE) {
        const files = (item as { files: File[] }).files;
        if (!files || files.length === 0) return false;

        // Check if at least one file has a supported type
        const hasValidFile = files.some(file => {
          const type = file.type.toLowerCase();
          return (
            type.startsWith('image/') ||
            type.startsWith('video/') ||
            type.startsWith('audio/') ||
            type === 'application/pdf' ||
            type === 'application/msword' ||
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
        });

        return hasValidFile;
      }

      // Default canDrop behavior for other item types
      return true;
    },

    hover: (
      item: DragItem,
      monitor: DropTargetMonitor<DragItem, { name: string } | undefined>
    ) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        setMousePosition(clientOffset);
      }

      if (!monitor.isOver({ shallow: true })) {
        if (isHovering) setIsHovering(false);
        setMousePosition(null);
        return;
      }
      if (!isHovering) setIsHovering(true);
    },

    drop: (item: DragItem, monitor) => {
      const dropOpId = `drop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Check if handled by parent
      if (monitor.didDrop()) {
        console.log(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Drop already handled by parent, ignoring.`
        );
        return undefined;
      }

      // Ensure drop target is still valid and we are directly over it
      if (!dropTargetRef.current || !monitor.isOver({ shallow: true })) {
        console.warn(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Drop target ref is null or not directly over.`
        );
        return undefined;
      }

      // Handle file drops
      if (monitor.getItemType() === NativeTypes.FILE) {
        if (!supabaseClient || !user) {
          toast.error("Please sign in to upload files");
          return undefined;
        }

        const files = (item as { files: File[] }).files;
        if (!files || files.length === 0) return undefined;

        // Find the first supported file
        const supportedFile = files.find(file => {
          const type = file.type.toLowerCase();
          return (
            type.startsWith('image/') ||
            type.startsWith('video/') ||
            type.startsWith('audio/') ||
            type === 'application/pdf' ||
            type === 'application/msword' ||
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
        });

        if (!supportedFile) {
          toast.error("No supported file types found");
          return undefined;
        }

        // Show loading state
        const loadingToast = toast.loading("Uploading file...");

        // Handle file upload in the background
        (async () => {
          try {
            // Upload file
            const url = await uploadMediaFile(supportedFile, user.id, supabaseClient);
            if (!url) {
              toast.dismiss(loadingToast);
              toast.error("Failed to upload file");
              return;
            }

            // Add to database
            const mediaItem = await addMediaItemToDatabase(
              supportedFile,
              url,
              user.id,
              supabaseClient
            );

            if (!mediaItem) {
              toast.dismiss(loadingToast);
              toast.error("Failed to save file information");
              return;
            }

            // Determine block type based on file type
            let blockType: string;
            if (supportedFile.type.startsWith('image/')) {
              blockType = 'image';
            } else if (supportedFile.type.startsWith('video/')) {
              blockType = 'video';
            } else if (supportedFile.type.startsWith('audio/')) {
              blockType = 'audio';
            } else {
              blockType = 'document';
            }

            // Add block to store
            addBlock(
              {
                type: blockType,
                content: url,
                dropAreaId: dropArea.id,
                ...(blockType === 'image' && { altText: supportedFile.name }),
              },
              dropArea.id
            );

            toast.dismiss(loadingToast);
            toast.success("File uploaded successfully");
          } catch (error) {
            console.error("Error handling file drop:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to process file");
          }
        })();

        return {
          name: "Started file upload",
          handled: true,
          dropAreaId: dropArea.id,
        };
      }

      // --- Core Logic: Determine if this hook should handle the drop ---
      const isAreaEmpty = dropArea.blocks.length === 0;
      const isExistingBlock = item.type === ItemTypes.EXISTING_BLOCK;
      const isExternalBlock =
        isExistingBlock && item.sourceDropAreaId !== dropArea.id && item.id;

      // Handle drops only if:
      // 1. Area is empty (for both new and external blocks)
      // 2. OR it's an external block (even to populated areas)
      const shouldHandleDrop = isAreaEmpty || isExternalBlock;

      if (!shouldHandleDrop) {
        console.log(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Delegating drop to nested handlers.`
        );
        return undefined;
      }

      try {
        // Handle new block into empty area
        if (!isExistingBlock && isAreaEmpty) {
          const result = {
            name: `Added Block to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
          };

          setTimeout(() => {
            addBlock(
              {
                type: item.type,
                content: item.content || "",
                dropAreaId: dropArea.id,
              },
              dropArea.id
            );
          }, 0);

          return result;
        }

        // Handle external block move (to either empty or populated area)
        if (isExternalBlock) {
          const result = {
            name: `Moved Block to ${dropArea.id}`,
            handled: true,
            dropAreaId: dropArea.id,
          };

          setTimeout(() => {
            moveBlock(item.id!, item.sourceDropAreaId!, dropArea.id);
          }, 0);

          return result;
        }

        return undefined;
      } catch (error) {
        console.error(
          `[${dropOpId}] DropAreaHook ${dropArea.id}: Error during drop:`,
          error
        );
        setDropError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setIsHovering(false);
        return undefined;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Helper function to check mouse proximity to element edges
  const isNearEdge = (
    mousePos: { x: number; y: number },
    element: HTMLElement | null
  ): boolean => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const edgeThreshold = 30; // Pixels from edge to trigger merge indicator

    // Check proximity to left or right edge for horizontal merging
    const nearLeftEdge = Math.abs(mousePos.x - rect.left) < edgeThreshold;
    const nearRightEdge = Math.abs(mousePos.x - rect.right) < edgeThreshold;

    // Ensure mouse is vertically within the element bounds (plus some tolerance)
    const verticalTolerance = 10;
    const isVerticallyInside =
      mousePos.y >= rect.top - verticalTolerance &&
      mousePos.y <= rect.bottom + verticalTolerance;

    return isVerticallyInside && (nearLeftEdge || nearRightEdge);
  };

  // --- Merge Logic ---

  // Check if this drop area can be merged with a sibling
  // This effect runs when hovering state or mouse position changes
  useEffect(() => {
    // Conditions to check for merge: hovering, have mouse position, have element ref
    if (!isHovering || !mousePosition || !dropTargetRef.current) {
      // If not hovering or missing data, ensure merge target is cleared
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target (not hovering or missing data)`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Check proximity: Only proceed if mouse is near the edge
    if (!isNearEdge(mousePosition, dropTargetRef.current)) {
      // If not near edge, ensure merge target is cleared
      if (mergeTarget !== null) {
        // console.log(`${dropArea.id}: Clearing merge target (not near edge)`); // Removed log
        setMergeTarget(null);
      }
      return;
    }

    // --- Proximity check passed, proceed with merge logic ---
    // console.log(`${dropArea.id}: Near edge, checking merge possibility...`); // Removed log

    // We need to be part of a split area to merge
    if (!dropArea.parentId) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no parent ID`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Find our parent area using the parentId, only if parentId exists
    const parent = dropArea.parentId
      ? findDropAreaById(dropAreas, dropArea.parentId)
      : null;
    if (!parent || !parent.isSplit || parent.splitAreas.length !== 2) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no valid parent found`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Find our sibling - we need a valid sibling to merge with
    const sibling = parent.splitAreas.find(
      (area: DropAreaType) => area.id !== dropArea.id
    ); // Added type DropAreaType
    if (!sibling) {
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because no sibling found`
        // );
        setMergeTarget(null);
      }
      return;
    }

    // Check if we can merge with the sibling (based on merge rules)
    if (canMerge(dropArea.id, sibling.id)) {
      // Only update if changing
      if (mergeTarget !== sibling.id) {
        // console.log(`${dropArea.id}: Setting merge target to ${sibling.id}`); // Removed log

        // Set the merge position based on which side we're on
        const isLeftArea = parent.splitAreas[0].id === dropArea.id;
        setMergePosition(isLeftArea ? "right" : "left");

        // Set the merge target (this should be last to ensure all other state is set first)
        setMergeTarget(sibling.id);
      }
    } else {
      // Clear the merge target if we can't merge
      if (mergeTarget !== null) {
        // console.log( // Removed log
        //   `${dropArea.id}: Clearing merge target because cannot merge with sibling`
        // );
        setMergeTarget(null);
      }
    }
  }, [
    isHovering,
    dropArea.id,
    dropArea.parentId,
    dropAreas,
    canMerge,
    mergeTarget,
    mousePosition, // Add mousePosition as dependency
  ]);

  // Determine visual cues based on drop state
  const getDropAreaStyles = () => {
    let baseClasses =
      "w-full min-h-[120px] rounded-xl border-2 relative bento-box transition-all duration-200";

    // Empty drop area has dashed border, populated has solid but subtle border
    if (dropArea.blocks.length === 0) {
      baseClasses += " border-dashed";
    } else {
      // For populated areas, show a subtle border when hovered
      baseClasses += isHovering ? " border-border" : " border-transparent";
    }

    // Visual cues for drag operations (Simplified)
    if (isOver && canDrop) {
      // Active drop target - strong visual cue
      baseClasses += " border-primary bg-primary/10 scale-[1.02] shadow-lg";
      // Removed isHoveringBetween logic
    } else if (canDrop) {
      // Potential drop target (item is draggable but not hovering) - subtle visual cue
      // Note: This state might not be visually distinct if isHovering is also true
      baseClasses += " border-primary/50 bg-primary/5";
    } else if (isHovering && dropArea.blocks.length > 0) {
      // Just hovering, not necessarily a valid drop target
      // Hovering over populated area - subtle highlight
      baseClasses += " bg-background/80 shadow-md";
    } else {
      // Default state
      baseClasses += " border-border";
    }

    // Add merge target highlight
    if (mergeTarget) {
      baseClasses += " border-green-500 bg-green-50/30";
    }

    // Add error state if there was a drop error
    if (dropError) {
      baseClasses += " border-red-500 bg-red-50";
    }

    return baseClasses;
  };

  const handleSplit = () => {
    // Pass viewport to canSplit
    if (canSplit(dropArea.id, viewport)) {
      splitDropArea(dropArea.id);
    }
  };

  const handleMerge = () => {
    if (mergeTarget) {
      mergeDropAreas(dropArea.id, mergeTarget);
    }
  };

  // Only show split indicator if:
  // 1. The area is being hovered
  // 2. The area is not currently being dragged over
  // 3. The area doesn't have any blocks yet
  // 4. The area can be split (based on split level restrictions)
  // Note: We allow showing the split indicator for empty areas even if they are part of a split
  const shouldShowSplitIndicator = (showSplitIndicator: boolean) => {
    // Pass viewport to canSplit
    const isSplittable = canSplit(dropArea.id, viewport);

    const shouldShow =
      showSplitIndicator &&
      isHovering &&
      !isOver &&
      dropArea.blocks.length === 0 &&
      isSplittable; // Use the result from canSplit
    // Removed !mergeTarget check here, will check against shouldShowMergeIndicator result

    // Determine if merge indicator *should* show based on proximity and merge target
    const showMerge = shouldShowMergeIndicator();

    // Final decision: Show split only if basic conditions met AND merge indicator isn't showing
    const finalShouldShow = shouldShow && !showMerge;

    // --- DEBUG LOGGING ---
    // Only log if the state might be relevant (hovering or indicator was expected)
    // if (isHovering || finalShouldShow) { // Removed log block
    //   // Update log condition
    //   console.log(`[Split Indicator Debug] Area: ${dropArea.id}`, {
    //     "Prop: showSplitIndicator": showSplitIndicator,
    //     "State: isHovering": isHovering,
    //     "State: isOver": isOver,
    //     "State: isEmpty": dropArea.blocks.length === 0,
    //     "Result: canSplit()": isSplittable,
    //     "State: mergeTarget": mergeTarget, // Keep for context
    //     "Check: shouldShowMergeIndicator()": showMerge, // Add merge check result
    //     "FINAL shouldShow": finalShouldShow, // Log final decision
    //     "Area Details": {
    //       id: dropArea.id,
    //       splitLevel: dropArea.splitLevel,
    //       isSplit: dropArea.isSplit,
    //       parentId: dropArea.parentId,
    //     },
    //     viewport: viewport,
    //   });
    // }
    // --- END DEBUG LOGGING ---

    return finalShouldShow; // Return the refined value
  };

  // Show merge indicator ONLY if we have a merge target AND mouse is near edge
  // This function remains the same, but its result is now used by shouldShowSplitIndicator
  const shouldShowMergeIndicator = () => {
    const nearEdge =
      mousePosition && dropTargetRef.current
        ? isNearEdge(mousePosition, dropTargetRef.current)
        : false;
    const showMerge = isHovering && mergeTarget !== null && !isOver && nearEdge;
    // Optional: Add similar debug log here if needed
    // if (isHovering && mergeTarget) {
    //   console.log(`[Merge Indicator Debug] Area: ${dropArea.id}`, { nearEdge, mergeTarget, isHovering, isOver, showMerge });
    // }
    return showMerge;
  };

  return {
    isOver,
    canDrop,
    isHovering,
    setIsHovering,
    drop: (el: HTMLDivElement | null) => {
      dropTargetRef.current = el;
      drop(el);
    },
    getDropAreaStyles,
    handleSplit,
    handleMerge,
    shouldShowSplitIndicator,
    shouldShowMergeIndicator,
    mergePosition,
    dropError,
  };
};

```

# lib/hooks/use-viewport.tsx

```tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Define viewport types
export type ViewportType = "desktop" | "tablet" | "mobile"

interface ViewportContextType {
  viewport: ViewportType
  setViewport: (viewport: ViewportType) => void
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined)

export function useViewport() {
  const context = useContext(ViewportContext)
  if (context === undefined) {
    throw new Error("useViewport must be used within a ViewportProvider")
  }
  return context
}

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<ViewportType>("desktop")

  return (
    <ViewportContext.Provider
      value={{
        viewport,
        setViewport,
      }}
    >
      {children}
    </ViewportContext.Provider>
  )
}


```

# lib/icons.ts

```ts
import { Trash2, Move, SquareSplitHorizontalIcon, SplitSquareVertical, Merge as MergeIcon } from "lucide-react"

// Export the Split icon with a more convenient name
export const Split = SplitSquareVertical
export { Trash2, Move, SquareSplitHorizontalIcon as SplitHorizontal, MergeIcon as Merge }


```

# lib/item-types.ts

```ts
export const ItemTypes = {
  SQUARE: "square",
  BLOCK: "block",
  EXISTING_BLOCK: "existing_block",
  MEDIA_IMAGE: "media_image", // Add type for media library images
} as const; // Use 'as const' for literal types

// Global object to track drop operations across different handlers
// This helps prevent double-handling of the same drop event
type DropState = {
  isBeingHandled: boolean;
  handledBy: string | null;
  itemId: string | null;
  timestamp: number;
  reset: () => void;
};

// Create a singleton for tracking drops globally
export const DropTracker: DropState = {
  isBeingHandled: false,
  handledBy: null,
  itemId: null,
  timestamp: 0,

  // Method to reset the tracker after each drop operation
  reset: function () {
    this.isBeingHandled = false;
    this.handledBy = null;
    this.itemId = null;
    this.timestamp = 0;
    console.log(`[DropTracker] Reset - ready for next drop operation`);
  },
};

// Mark a drop as being handled
export function markDropHandled(handlerId: string, itemId: string): boolean {
  // If drop is already being handled and it's recent (last 500ms), reject
  const now = Date.now();
  if (DropTracker.isBeingHandled && now - DropTracker.timestamp < 500) {
    console.log(
      `[DropTracker] Drop for item ${itemId} REJECTED - already being handled by ${DropTracker.handledBy}`
    );
    return false;
  }

  // Otherwise, claim this drop
  DropTracker.isBeingHandled = true;
  DropTracker.handledBy = handlerId;
  DropTracker.itemId = itemId;
  DropTracker.timestamp = now;

  console.log(`[DropTracker] Drop for item ${itemId} claimed by ${handlerId}`);

  // Schedule an automatic reset after 500ms
  setTimeout(() => {
    if (DropTracker.itemId === itemId && DropTracker.handledBy === handlerId) {
      DropTracker.reset();
    }
  }, 500);

  return true;
}

```

# lib/lucide-icons.ts

```ts
import { Trash2, Move, SquareSplitHorizontalIcon as SplitHorizontal, Split } from "lucide-react"

export { Trash2, Move, SplitHorizontal, Split }


```

# lib/mock-data.ts

```ts
import type { Project } from "@/lib/types";

export const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "Startseite",
    description:
      "Unternehmens-Startseite mit Hero-Bereich, Funktionen und Kontaktformular",
    createdAt: new Date(2023, 10, 15).toISOString(),
    updatedAt: new Date(2023, 11, 2).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 12,
  },
  {
    id: "project-2",
    title: "Produkt-Dashboard",
    description: "Admin-Dashboard für Produktverwaltung mit Analysen",
    createdAt: new Date(2023, 9, 20).toISOString(),
    updatedAt: new Date(2023, 10, 25).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 8,
  },
  {
    id: "project-3",
    title: "Blog-Layout",
    description:
      "Blog-Seite mit Seitenleiste, ausgewählten Beiträgen und Newsletter-Anmeldung",
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 9, 18).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 15,
  },
  {
    id: "project-4",
    title: "E-Commerce Produktseite",
    description:
      "Produktdetailseite mit Bildergalerie, Spezifikationen und Warenkorb-Funktionalität",
    createdAt: new Date(2023, 7, 12).toISOString(),
    updatedAt: new Date(2023, 8, 30).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 10,
  },
  {
    id: "project-5",
    title: "Portfolio-Vorlage",
    description:
      "Persönliches Portfolio mit Projektpräsentation und Kontaktinformationen",
    createdAt: new Date(2023, 6, 25).toISOString(),
    updatedAt: new Date(2023, 7, 15).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 7,
  },
];

```

# lib/supabase.ts

```ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


```

# lib/supabase/client.ts

```ts
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for browser environments with refresh support
 * This approach creates a fresh client when needed rather than using a static singleton
 */
export function createClient() {
  if (typeof window === "undefined") {
    console.warn("createClient should only be called in browser environments")
    return undefined
  }

  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase URL or Anon Key not found. Using fallback values.")
      // Continue with fallback values
    }

    // Create a fresh client instance each time to ensure latest auth state
    const client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key",
    )

    // Ensure the client is properly initialized
    if (!client) {
      throw new Error("Failed to create Supabase client")
    }

    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return undefined
  }
}

// Note: We're removing the singleton pattern to avoid stale auth state

```

# lib/supabase/database.ts

```ts
import { createClient } from "@/lib/supabase/client"
import type { DropAreaType, Project } from "@/lib/types"

// Define the project data structure for database
export interface ProjectData {
  id: string
  title: string
  description?: string
  dropAreas: DropAreaType[]
  createdAt: string
  updatedAt: string
}

// Create a singleton instance of the Supabase client
const getSupabase = () => {
  if (typeof window === "undefined") return null
  return createClient()
}

/**
 * Save a project to Supabase database
 */
export async function saveProjectToDatabase(projectData: ProjectData): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    // First, check if the project exists
    const { data: existingProject, error: checkError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectData.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking if project exists:", checkError)
      return false
    }

    // Convert the project data to a format suitable for the database
    const projectRecord = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      created_at: projectData.createdAt,
      updated_at: projectData.updatedAt,
      project_data: JSON.stringify(projectData), // Store the entire project data as JSON
    }

    if (existingProject) {
      // Update existing project
      const { error: updateError } = await supabase.from("projects").update(projectRecord).eq("id", projectData.id)

      if (updateError) {
        console.error("Error updating project:", updateError)
        return false
      }
    } else {
      // Insert new project
      const { error: insertError } = await supabase.from("projects").insert(projectRecord)

      if (insertError) {
        console.error("Error inserting project:", insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error saving project to database:", error)
    return false
  }
}

/**
 * Load a project from Supabase database
 */
export async function loadProjectFromDatabase(projectId: string): Promise<ProjectData | null> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    const { data, error } = await supabase.from("projects").select("project_data").eq("id", projectId).single()

    if (error) {
      console.error("Error loading project:", error)
      return null
    }

    if (!data || !data.project_data) {
      console.error("No project data found")
      return null
    }

    // Parse the JSON data
    try {
      const projectData = JSON.parse(data.project_data) as ProjectData
      return projectData
    } catch (parseError) {
      console.error("Error parsing project data:", parseError)
      return null
    }
  } catch (error) {
    console.error("Error loading project from database:", error)
    return null
  }
}

/**
 * List all projects from Supabase database
 */
export async function listProjectsFromDatabase(): Promise<Project[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, created_at, updated_at, project_data")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error listing projects:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Convert database records to Project objects
    const projects: Project[] = data.map((record) => {
      let blockCount = 0

      // Try to count blocks from project_data
      try {
        const projectData = JSON.parse(record.project_data)
        blockCount = countBlocks(projectData.dropAreas)
      } catch (e) {
        console.warn("Could not parse project data to count blocks:", e)
      }

      return {
        id: record.id,
        title: record.title,
        description: record.description,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        blocks: blockCount,
        thumbnail: undefined, // No thumbnail in database approach
      }
    })

    return projects
  } catch (error) {
    console.error("Error listing projects from database:", error)
    return []
  }
}

/**
 * Delete a project from Supabase database
 */
export async function deleteProjectFromDatabase(projectId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("Error deleting project:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}

/**
 * Helper function to count the total number of blocks in a project
 */
function countBlocks(dropAreas: DropAreaType[]): number {
  let count = 0

  for (const area of dropAreas) {
    // Count blocks in this area
    count += area.blocks.length

    // Count blocks in split areas recursively
    if (area.isSplit && area.splitAreas.length > 0) {
      count += countBlocks(area.splitAreas)
    }
  }

  return count
}

/**
 * Initialize the database schema if it doesn't exist
 */
export async function initializeDatabase(): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    // Check if the projects table exists by trying to select from it
    const { error } = await supabase.from("projects").select("id").limit(1)

    if (error) {
      console.error("Error checking projects table:", error)
      console.warn("Projects table may not exist. Please run the SQL setup script.")
      return false
    }

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

/**
 * Migrate mock projects to Supabase database
 */
export async function migrateMockProjectsToDatabase(mockProjects: Project[]): Promise<boolean> {
  try {
    // Initialize database first
    const initialized = await initializeDatabase()
    if (!initialized) {
      console.warn("Database initialization failed, but continuing anyway")
    }

    let successCount = 0
    let failCount = 0

    // For each mock project, create a database entry
    for (const project of mockProjects) {
      try {
        // Create a basic project structure
        const projectData: ProjectData = {
          id: project.id,
          title: project.title,
          description: project.description,
          dropAreas: [
            {
              id: "drop-area-1",
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ],
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        }

        // Save the project to database
        const saved = await saveProjectToDatabase(projectData)
        if (saved) {
          successCount++
        } else {
          failCount++
          console.warn(`Failed to migrate project: ${project.id}, but continuing with others`)
        }
      } catch (projectError) {
        failCount++
        console.error(`Error migrating project ${project.id}:`, projectError)
        // Continue with other projects
      }
    }

    console.log(`Migration complete. Success: ${successCount}, Failed: ${failCount}`)
    return successCount > 0
  } catch (error) {
    console.error("Error migrating mock projects:", error)
    return false
  }
}


```

# lib/supabase/database.types

```types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      columns: {
        Row: {
          id: string
          title: string
          position: number
          created_at?: string
        }
        Insert: {
          id?: string
          title: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          position?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          content: string
          column_id: string
          created_at?: string
        }
        Insert: {
          id?: string
          content: string
          column_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          column_id?: string
          created_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


```

# lib/supabase/database.types.ts

```ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      columns: {
        Row: {
          id: string
          title: string
          position: number
          created_at?: string
        }
        Insert: {
          id?: string
          title: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          position?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          content: string
          column_id: string
          created_at?: string
        }
        Insert: {
          id?: string
          content: string
          column_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          column_id?: string
          created_at?: string
        }
      }
      media_items: {
        Row: {
          id: string
          file_name: string
          file_type: string
          url: string
          size: number
          width: number
          height: number
          user_id: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          url: string
          size: number
          width: number
          height: number
          user_id: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          url?: string
          size?: number
          width?: number
          height?: number
          user_id?: string
          uploaded_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

```

# lib/supabase/middleware.ts

```ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for middleware with proper cookie handling
 */
export function createMiddlewareClient(request: NextRequest) {
  // Create a response object that we'll modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(
          name: string,
          value: string,
          options: {
            path?: string
            maxAge?: number
            domain?: string
            secure?: boolean
            sameSite?: "strict" | "lax" | "none"
          },
        ) {
          // Update both the request and response cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          // Update both the request and response cookies
          request.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    },
  )

  return { supabase, response }
}

```

# lib/supabase/server.ts

```ts
import { createServerClient as createSupaServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/types"

/**
 * Creates a Supabase client for server components with cookie handling
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createSupaServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(
          name: string,
          value: string,
          options: {
            path?: string
            maxAge?: number
            domain?: string
            secure?: boolean
            sameSite?: "strict" | "lax" | "none"
          },
        ) {
          try {
            cookieStore.set(name, value, options)
          } catch (err) {
            // This will throw in middleware or when cookies are read-only
            // We can safely ignore this error since it's handled by the middleware
            console.debug('Cookie set error:', err);
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          } catch (err) {
            // This will throw in middleware or when cookies are read-only
            // We can safely ignore this error since it's handled by the middleware
            console.debug('Cookie remove error:', err);
          }
        },
      },
    },
  )
}

```

# lib/supabase/storage.ts

```ts
import { createClient } from "@/lib/supabase/client";
import type { DropAreaType } from "@/lib/types";
import type { ProjectData } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Define the Project type for UI display
interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: number;
  thumbnail?: string;
}

// We now use the ProjectData type from lib/types

// Get a fresh Supabase client instance each time to avoid stale auth state and caching issues
const getSupabase = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const client = createClient();
  if (!client) {
    return null;
  }

  return client;
};

// The name of the storage bucket for projects
const BUCKET_NAME = "projects";

// Initialize storage and verify bucket access
export async function initializeStorage(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 1 });

    return !error;
  } catch {
    return false;
  }
}

// Save project data to Supabase storage with improved error handling
export async function saveProjectToStorage(
  projectData: ProjectData
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session;

    if (!isAuthenticated) {
      return false;
    }

    // Initialize storage and check bucket access
    const initResult = await initializeStorage();
    if (!initResult) {
      return false;
    }

    // Always update the modified timestamp
    projectData.updatedAt = new Date().toISOString();

    // Convert project data to JSON string with pretty formatting
    const jsonData = JSON.stringify(projectData, null, 2);

    // Create a buffer from the JSON string
    const jsonBuffer = new Uint8Array(new TextEncoder().encode(jsonData));

    // Attempt the upload with minimal options
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${projectData.id}.json`, jsonBuffer, {
        contentType: "application/json",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Load a project from Supabase storage with improved error handling
 */
export async function loadProjectFromStorage(
  projectId: string
): Promise<ProjectData | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  try {
    await supabase.auth.getSession();

    // Initialize storage and check access
    await initializeStorage();

    // Add a timestamp to avoid caching issues
    const timestamp = new Date().getTime();

    // Attempt to download the file directly
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${projectId}.json?t=${timestamp}`);

    if (error || !data) {
      return null;
    }

    // Process the downloaded data
    const jsonData = await data.text();
    return JSON.parse(jsonData) as ProjectData;
  } catch {
    return null;
  }
}

/**
 * List all projects from Supabase storage with improved error handling and caching control
 */
export async function listProjectsFromStorage(): Promise<Project[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  try {
    await supabase.auth.getSession();
    await initializeStorage();

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(``, {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error || !data || data.length === 0) {
      return [];
    }

    // Filter for JSON files
    const projectFiles = data.filter((file) => file.name.endsWith(".json"));

    // Load each project's metadata
    const projects: Project[] = [];

    for (const file of projectFiles) {
      try {
        const projectId = file.name.replace(".json", "");
        const projectData = await loadProjectFromStorage(projectId);
        if (projectData) {
          let thumbnail: string | undefined = undefined;

          try {
            thumbnail = await getProjectThumbnail(projectId);
          } catch {
            // Ignore thumbnail errors
          }

          projects.push({
            id: projectData.id,
            title: projectData.title,
            description: projectData.description,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt,
            blocks: countBlocks(projectData.dropAreas),
            thumbnail,
          });
        }
      } catch {
        continue;
      }
    }

    return projects;
  } catch {
    return [];
  }
}

/**
 * Delete a project from Supabase storage
 */
export async function deleteProjectFromStorage(
  projectId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // Delete the project file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${projectId}.json`]);

    if (error) {
      return false;
    }

    // Also delete the thumbnail if it exists
    try {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([`thumbnails/${projectId}.png`]);
    } catch {
      // Ignore errors when deleting thumbnails
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Save a project thumbnail to Supabase storage
 */
export async function saveProjectThumbnail(
  projectId: string,
  thumbnailBlob: Blob
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Upload the thumbnail to Supabase storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`thumbnails/${projectId}.png`, thumbnailBlob, {
        cacheControl: "3600",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      return null;
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`thumbnails/${projectId}.png`);

    return publicUrl;
  } catch {
    return null;
  }
}

/**
 * Get a project thumbnail URL from Supabase storage
 */
export async function getProjectThumbnail(
  projectId: string
): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;

  try {
    // Check if the thumbnail exists
    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .list("thumbnails");

    const thumbnailExists = data?.some(
      (file) => file.name === `${projectId}.png`
    );

    if (!thumbnailExists) {
      return undefined;
    }

    // Get the public URL for the thumbnail
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`thumbnails/${projectId}.png`);

    return publicUrl;
  } catch {
    return undefined;
  }
}

/**
 * Helper function to count the total number of blocks in a project
 */
function countBlocks(dropAreas: DropAreaType[]): number {
  let count = 0;

  for (const area of dropAreas) {
    // Count blocks in this area
    count += area.blocks.length;

    // Count blocks in split areas recursively
    if (area.isSplit && area.splitAreas.length > 0) {
      count += countBlocks(area.splitAreas);
    }
  }

  return count;
}

// Update the migrateMockProjects function to handle errors better
export async function migrateMockProjects(
  mockProjects: Project[]
): Promise<boolean> {
  try {
    // Initialize storage first
    await initializeStorage();

    let successCount = 0;

    // For each mock project, create a storage entry
    for (const project of mockProjects) {
      try {
        // Create a basic project structure
        const projectData: ProjectData = {
          id: project.id,
          title: project.title,
          description: project.description,
          dropAreas: [
            {
              id: "drop-area-1",
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ],
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };

        // Save the project to storage
        const saved = await saveProjectToStorage(projectData);
        if (saved) {
          successCount++;
        }
      } catch {
        continue;
      }
    }

    return successCount > 0;
  } catch {
    return true;
  }
}

// Constants for supported media types and their corresponding buckets
const BUCKET_MAPPING = {
  image: 'images',
  video: 'videos',
  audio: 'audio',
  document: 'documents'
} as const;

// --- NEU: Hilfsfunktion zum Bereinigen von Dateinamen (kopiert aus mediathek-view) ---
const sanitizeFilename = (filename: string): string => {
  // Umlaute und ß ersetzen
  const umlautMap: { [key: string]: string } = {
    ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss",
  };
  let sanitized = filename;
  for (const key in umlautMap) {
    sanitized = sanitized.replace(new RegExp(key, "g"), umlautMap[key]);
  }

  // Leerzeichen durch Unterstriche ersetzen und ungültige Zeichen entfernen
  return sanitized
    .replace(/\s+/g, "_") // Ersetzt ein oder mehrere Leerzeichen durch einen Unterstrich
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Entfernt alle Zeichen außer Buchstaben, Zahlen, Punkt, Unterstrich, Bindestrich
};

/**
 * Get media type category from MIME type
 * @param mimeType The MIME type of the file
 * @returns The media category or null if unsupported
 */
function getMediaCategory(mimeType: string): keyof typeof BUCKET_MAPPING | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  // Consider common document types
  if (
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ].includes(mimeType)
  ) {
    return "document";
  }
  return null;
}

/**
 * Upload a media file to the appropriate Supabase storage bucket
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @param supabaseClient The Supabase client instance
 * @returns The public URL of the uploaded file or null if upload fails
 */
export async function uploadMediaFile(
  file: File,
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<string | null> {
  const category = getMediaCategory(file.type);
  if (!category) {
    console.error("Unsupported file type:", file.type);
    return null;
  }

  const bucket = BUCKET_MAPPING[category];

  // --- MODIFIZIERT: Dateinamen bereinigen ---
  const sanitizedFileName = sanitizeFilename(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;

  try {
    console.log(
      `Attempting to upload ${file.name} (sanitized: ${sanitizedFileName}) to bucket ${bucket} at path ${filePath}`
    );

    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading file ${file.name}:`, uploadError);
      throw uploadError; // Re-throw to be caught below
    }

    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error(`Could not get public URL for ${filePath}`);
      return null;
    }

    console.log(`Upload successful for ${file.name}. URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`Failed during upload process for ${file.name}:`, error);
    return null;
  }
}

/**
 * Add a media item to the database
 * @param file The original file
 * @param url The public URL of the uploaded file
 * @param userId The ID of the user
 * @param supabaseClient The Supabase client instance
 * @returns The created media item record or null if operation fails
 */
export async function addMediaItemToDatabase(
  file: File,
  url: string,
  userId: string,
  supabaseClient: SupabaseClient<Database>
): Promise<Database['public']['Tables']['media_items']['Row'] | null> {
  try {
    const mediaCategory = getMediaCategory(file.type);
    if (!mediaCategory) {
      return null;
    }

    let dimensions = undefined;
    if (mediaCategory === 'image') {
      dimensions = await getImageDimensions(file);
    }

    const mediaItem = {
      file_name: file.name,
      file_type: file.type,
      url: url,
      size: file.size,
      user_id: userId,
      uploaded_at: new Date().toISOString(),
      width: dimensions?.width ?? 0,
      height: dimensions?.height ?? 0
    };

    const { data, error } = await supabaseClient
      .from('media_items')
      .insert(mediaItem)
      .select()
      .single();

    if (error) {
      console.error('Error adding media item to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addMediaItemToDatabase:', error);
    return null;
  }
}

/**
 * Get dimensions of an image file
 * @param file The image file
 * @returns Promise resolving to width and height or undefined if not possible
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    img.src = url;
  });
}

```

# lib/supabase/supabase-browser.ts

```ts
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/database.types"

// Create a module-level variable to store the client instance
let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

// Function to get or create the Supabase browser client
export function getSupabaseBrowserClient() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient should only be called in the browser")
  }

  // For production, or if we already have an instance, return it
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  // Create a new instance
  supabaseClientInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClientInstance
}

// Export a function to get the client
// This ensures we only create the client when it's actually used
export const supabaseBrowser = typeof window !== "undefined" ? getSupabaseBrowserClient() : null


```

# lib/supabase/supabase-middleware.ts

```ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export function getSupabaseMiddlewareClient(request: NextRequest) {
  // Create a response object that we'll modify later
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: "strict" | "lax" | "none" }) {
          // Update the request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })

          // Update the response cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          // Update the request cookies
          request.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })

          // Update the response cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    },
  )

  return { supabase, response }
}


```

# lib/supabase/supabase-server.ts

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export function getSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: "strict" | "lax" | "none" }) {
          try {
            cookieStore.set(name, value, options)
          } catch (err) {
            // This will throw in middleware, but we can ignore it since we're
            // handling setting cookies in the middleware separately
            console.debug('Cookie set error in server client:', err);
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          } catch (err) {
            // This will throw in middleware, but we can ignore it
            console.debug('Cookie remove error in server client:', err);
          }
        },
      },
    },
  )
}


```

# lib/supabase/types.ts

```ts

```

# lib/types.ts

```ts
export interface BlockType {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  dropAreaId: string;
  // Additional properties for specific block types
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  altText?: string; // For images
  fileName?: string; // For documents
  thumbnailUrl?: string; // NEU: For document previews
  // Add more properties for other block types as needed
}

export interface DropAreaType {
  id: string;
  blocks: BlockType[];
  isSplit: boolean;
  splitAreas: DropAreaType[]; // Changed from string[]
  splitLevel: number;
  parentId?: string | null; // Added parent ID
}

export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  dropAreas: DropAreaType[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: number;
  thumbnail?: string;
}

// Media Library Types
export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface MediaLibraryState {
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  // Pagination state
  page: number;
  hasMore: boolean;
  itemsPerPage: number;
}

```

# lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // If less than 24 hours ago, show relative time
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    }
    const hours = Math.floor(diffInHours);
    return `vor ${hours} Stunde${hours !== 1 ? "n" : ""}`;
  }

  // If less than 7 days ago, show day of week
  if (diffInHours < 168) {
    // 7 days * 24 hours
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    return date.toLocaleDateString(undefined, options);
  }

  // Otherwise show month and day
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
}

```

# lib/utils/block-utils.ts

```ts
import type { ViewportType } from "@/lib/hooks/use-viewport";

// Define a partial type for the block properties needed by getBlockStyle
type BlockStyleProps = {
  type: string;
  headingLevel?: number;
};

// Get block style based on block type and viewport
export const getBlockStyle = (
  block: BlockStyleProps, // Use the partial type
  viewport: ViewportType = "desktop"
) => {
  const baseStyle = (() => {
    switch (block.type) {
      case "heading": {
        // Get heading level or default to 1
        const headingLevel = block.headingLevel || 1;

        // Different styles based on heading level
        const headingStyles = {
          1: "text-4xl font-bold",
          2: "text-3xl font-bold",
          3: "text-2xl font-bold",
          4: "text-xl font-bold",
          5: "text-lg font-bold",
          6: "text-base font-bold",
        };

        return (
          headingStyles[headingLevel as keyof typeof headingStyles] ||
          headingStyles[1]
        );
      }
      case "paragraph":
        return "text-base";
      case "image":
        return "bg-secondary aspect-video flex items-center justify-center";
      case "button":
        return "inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg";
      case "form":
        return "bg-secondary p-4 rounded-lg border border-border";
      case "divider":
        return "border-t border-border w-full h-0 my-2";
      default:
        return "";
    }
  })();

  // Apply viewport adjustments if needed
  if (block.type === "heading" && viewport !== "desktop") {
    // For headings on smaller viewports, we keep the style as is
    // Already handled in the base style with specific level styling
    return baseStyle;
  }

  // Optionally add responsive adjustments for other block types here
  // For example: if (viewport === "mobile" && block.type === "paragraph") return `${baseStyle} text-sm`;

  // For non-heading blocks or when no specific viewport adjustments are needed
  return baseStyle;
};

```

# lib/utils/drop-area-utils.ts

```ts
import type { DropAreaType, BlockType } from "@/lib/types";

// Helper function to find a drop area by ID (including nested areas)
export const findDropAreaById = (
  areas: DropAreaType[],
  id: string
): DropAreaType | null => {
  for (const area of areas) {
    if (area.id === id) return area;

    if (area.isSplit && area.splitAreas.length > 0) {
      const found = findDropAreaById(area.splitAreas, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to find a block by ID in any drop area
export const findBlockById = (
  areas: DropAreaType[],
  blockId: string
): {
  block: BlockType | null;
  dropAreaId: string | null;
} => {
  for (const area of areas) {
    // Check blocks in this area
    const block = area.blocks.find((block) => block.id === blockId);
    if (block) {
      return { block, dropAreaId: area.id };
    }

    // Check blocks in split areas
    if (area.isSplit && area.splitAreas.length > 0) {
      const result = findBlockById(area.splitAreas, blockId);
      if (result.block) {
        return result;
      }
    }
  }
  return { block: null, dropAreaId: null };
};

// Helper function to update a drop area by ID (including nested areas)
export const updateDropAreaById = (
  areas: DropAreaType[],
  id: string,
  updater: (area: DropAreaType) => DropAreaType
): DropAreaType[] => {
  return areas.map((area) => {
    if (area.id === id) {
      return updater(area);
    }

    if (area.isSplit && area.splitAreas.length > 0) {
      return {
        ...area,
        splitAreas: updateDropAreaById(area.splitAreas, id, updater),
      };
    }

    return area;
  });
};

// Helper function to check if a drop area is empty (no blocks and not split)
export const isDropAreaEmpty = (area: DropAreaType): boolean => {
  if (area.blocks.length > 0) return false;
  if (
    area.isSplit &&
    area.splitAreas.some((subArea) => !isDropAreaEmpty(subArea))
  )
    return false;
  return true;
};

// Filter out empty drop areas for preview
export const filterNonEmptyDropAreas = (
  dropAreas: DropAreaType[]
): DropAreaType[] => {
  return dropAreas.filter(
    (area) =>
      area.blocks.length > 0 ||
      (area.isSplit &&
        area.splitAreas.some(
          (subArea) =>
            subArea.blocks.length > 0 ||
            (subArea.isSplit &&
              subArea.splitAreas.some(
                (nestedArea) => nestedArea.blocks.length > 0
              ))
        ))
  );
};

// Find the parent drop area that contains the two specified areas as split areas
export const findParentOfSplitAreas = (
  areas: DropAreaType[],
  firstAreaId: string,
  secondAreaId: string
): DropAreaType | null => {
  for (const area of areas) {
    if (area.isSplit && area.splitAreas.length === 2) {
      const hasFirstArea = area.splitAreas.some(
        (splitArea) => splitArea.id === firstAreaId
      );
      const hasSecondArea = area.splitAreas.some(
        (splitArea) => splitArea.id === secondAreaId
      );

      // If both areas are found in this parent's split areas, return the parent
      if (hasFirstArea && hasSecondArea) {
        return area;
      }
    }

    // Recursively check any split areas
    if (area.isSplit && area.splitAreas.length > 0) {
      const parent = findParentOfSplitAreas(
        area.splitAreas,
        firstAreaId,
        secondAreaId
      );
      if (parent) return parent;
    }
  }

  return null;
};

// Check if two areas can be merged
export const canMergeAreas = (
  areas: DropAreaType[],
  firstAreaId: string,
  secondAreaId: string
): boolean => {
  // Find the two areas
  const firstArea = findDropAreaById(areas, firstAreaId);
  const secondArea = findDropAreaById(areas, secondAreaId);

  if (!firstArea || !secondArea) return false;

  // Check if both areas are empty or if one is empty and one has content
  // Areas that are already split cannot be merged
  const firstAreaEmpty = firstArea.blocks.length === 0 && !firstArea.isSplit;
  const secondAreaEmpty = secondArea.blocks.length === 0 && !secondArea.isSplit;

  // Allow merge if at least one area is empty and neither area is already split
  const validContents =
    (firstAreaEmpty || secondAreaEmpty) &&
    !firstArea.isSplit &&
    !secondArea.isSplit;

  if (!validContents) {
    // Debug log: this might be why we can't merge
    console.log(
      `Cannot merge ${firstAreaId} and ${secondAreaId}: invalid contents`,
      {
        firstAreaEmpty,
        firstAreaBlocks: firstArea.blocks.length,
        firstAreaSplit: firstArea.isSplit,
        secondAreaEmpty,
        secondAreaBlocks: secondArea.blocks.length,
        secondAreaSplit: secondArea.isSplit,
      }
    );
    return false;
  }

  // Find the parent that contains both areas as split areas
  const parent = findParentOfSplitAreas(areas, firstAreaId, secondAreaId);

  // The areas must be siblings (have the same parent)
  const canMerge = parent !== null;

  if (!canMerge) {
    console.log(
      `Cannot merge ${firstAreaId} and ${secondAreaId}: not siblings`
    );
  }

  return canMerge;
};

```

# lib/utils/viewport-utils.ts

```ts
import type { ViewportType } from "@/lib/hooks/use-viewport"

// Define viewport container styles
export const getViewportStyles = (viewport: ViewportType) => {
  const styles = {
    desktop: {
      width: "100%", // Will be controlled by parent container
      maxWidth: "100%",
      padding: "2rem",
    },
    tablet: {
      width: "768px",
      maxWidth: "100%",
      padding: "1.5rem",
      border: "12px solid #333",
      borderRadius: "24px",
    },
    mobile: {
      width: "375px",
      maxWidth: "100%",
      padding: "1rem",
      border: "8px solid #333",
      borderRadius: "32px",
    },
  }

  return styles[viewport]
}

// Get container class based on viewport
export const getViewportContainerClass = (viewport: ViewportType) => {
  return viewport === "desktop" ? "w-full max-w-5xl" : ""
}


```

# LICENSE.md

```md
# License

Copyright (c) 2025 Matthias Meister

## Personal Use License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, for **personal, non-commercial purposes only**.

## Restrictions

The Software may **not** be used for commercial purposes. "Commercial purposes" includes, but is not limited to:

- Selling the Software or derivatives thereof.
- Using the Software in a product or service that generates revenue.
- Using the Software for commercial gain in any way.

## Disclaimer

The above permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**Note:** This is a custom license drafted for simplicity based on user request. It is recommended to consult with a legal professional or use a standard license (like CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/) for robust legal protection and clarity.

```

# memory-bank/activeContext.md

```md
# Active Context

## Current work focus

1. Project Initialization

   - ✅ Setting up project structure
   - ✅ Configuring development environment
   - ✅ Establishing documentation standards

2. Core Features Development

   - 🏗️ Visual editor interface
   - 🏗️ Component system
   - 🏗️ Drag-and-drop functionality

3. Infrastructure Setup
   - 🏗️ Supabase integration
   - 🏗️ Authentication system
   - 🏗️ State management implementation

## Recent changes

1. Project Setup

   - ✅ Initialized Next.js project with TypeScript
   - ✅ Added essential dependencies
   - ✅ Configured Tailwind CSS and shadcn/ui
   - 🏗️ Set up Supabase client

2. Documentation

   - ✅ Created Memory Bank structure
   - ✅ Documented project architecture
   - ✅ Established development guidelines

3. Environment Configuration
   - 🏗️ Added environment variables
   - ✅ Configured development tools
   - ✅ Set up linting and formatting

## Next steps

1. Priority Tasks

   - Configure Supabase environment and credentials
   - Set up development database
   - Implement authentication flow with Supabase
   - Create basic editor layout structure

2. Short-term Goals

   - Design and implement component library
   - Set up Zustand store for editor state
   - Create drag-and-drop infrastructure
   - Implement basic block components

3. Future Considerations
   - Rich text editing with TipTap
   - Advanced component features
   - Real-time collaboration features
   - Export functionality

## Active decisions and considerations

1. Technical Decisions

   - Using App Router for modern Next.js features
   - Implementing Zustand for state management
   - Utilizing shadcn/ui for consistent UI components
   - Integrating TipTap for potential rich text editing

2. Architecture Considerations

   - Component modularity and reusability
   - State management patterns for editor
   - Performance optimization strategies
   - TypeScript type definitions structure

3. UX Considerations
   - Intuitive drag-and-drop interface
   - Responsive design implementation
   - Clear feedback mechanisms
   - Accessibility compliance

```

# memory-bank/productContext.md

```md
# Product Context

## Why this project exists

Boards Klon exists to democratize web development by providing a visual web building solution that bridges the gap between professional developers and users who want to create web content without coding knowledge. It addresses the growing need for tools that make web development more accessible while maintaining professional standards and flexibility.

## Problems it solves

1. Technical Barrier

   - Eliminates the need for direct code manipulation
   - Provides visual representation of web layouts
   - Reduces learning curve for web development

2. Development Speed

   - Accelerates web page creation process
   - Enables rapid prototyping
   - Streamlines content management

3. Design Consistency
   - Ensures consistent component usage
   - Maintains responsive design principles
   - Standardizes layout patterns

## How it should work

1. User Flow

   - Sign in to personal account
   - Create new project or load existing one
   - Drag components from sidebar to canvas
   - Configure components through property panel
   - Preview in different device sizes
   - Save progress automatically

2. Editor Interface

   - Left sidebar: Component library
   - Main canvas: Drop zone for components
   - Right sidebar: Component configuration
   - Top bar: Project management and preview controls

3. Component System
   - Predefined block types
   - Customizable properties
   - Nested component support
   - Responsive behavior

## User experience goals

1. Intuitive Design

   - Clear visual hierarchy
   - Consistent interaction patterns
   - Immediate feedback on actions
   - Helpful UI guidance

2. Performance

   - Smooth drag and drop operations
   - Quick component rendering
   - Responsive preview switching
   - Efficient state updates

3. Reliability

   - Automatic save functionality
   - Stable component behavior
   - Error prevention
   - Data persistence

4. Accessibility
   - Keyboard navigation support
   - Screen reader compatibility
   - Clear visual indicators
   - Proper ARIA attributes

```

# memory-bank/progress.md

```md
# Progress

## What works

1. Project Setup

   - ✅ Next.js application structure
   - ✅ TypeScript configuration
   - ✅ Tailwind CSS integration
   - ✅ Basic development environment

2. Dependencies

   - ✅ Core packages installed
   - ✅ Development tools configured
   - ✅ Build system working
   - ✅ Linting setup complete

3. Documentation
   - ✅ Memory Bank structure established
   - ✅ Project architecture documented
   - ✅ Development guidelines created
   - ✅ Technical context defined

## What's left to build

1. Core Features

   - 🏗️ Authentication system
   - 🏗️ Visual editor interface
   - 🏗️ Component library
   - 🏗️ Drag-and-drop functionality
   - 🏗️ Project management
   - 🏗️ Preview system

2. Infrastructure

   - 🏗️ Supabase integration
   - 🏗️ State management setup
   - 🏗️ API routes
   - 🏗️ Data models

3. User Interface
   - 🏗️ Editor components
   - 🏗️ Block components
   - 🏗️ Configuration panels
   - 🏗️ Responsive layouts

## Current status

1. Project Phase

   - ✅ Initial setup phase
   - ✅ Documentation in progress
   - 🏗️ Core architecture planning
   - 🏗️ Development environment ready

2. Development Progress

   - Project structure: 100%
   - Documentation: 100%
   - Core setup: 90%
   - Feature development: 0%

3. Timeline Status
   - ✅ Project initialized
   - ✅ Basic configuration complete
   - 🏗️ Ready for feature development
   - 🏗️ Core implementation pending

## Known issues

1. Setup Issues

   - Environment variables configuration needed
   - Supabase project setup and credentials required
   - Development database configuration pending
   - Test environment setup needed

2. Technical Debt

   - Component type definitions needed
   - Test suite setup required
   - API route structure planning needed
   - State management implementation pending

3. Pending Decisions
   - Block component hierarchy and structure
   - Editor state management patterns
   - Database schema design
   - Component library organization
   - Preview mode implementation strategy

```

# memory-bank/projectbrief.md

```md
# Project Brief

_Foundation document that shapes all other files_

## Core Requirements

1. Visual Web Builder Interface

   - Drag-and-drop functionality for building layouts
   - Component block system for content structuring
   - Real-time preview capabilities
   - Responsive design support

2. User Management

   - Secure authentication system
   - Project saving and loading
   - User-specific content management

3. Editor Features
   - Block configuration via sidebar
   - Multiple viewport preview modes
   - Component library with predefined blocks

## Project Goals

1. Create an intuitive visual web builder that allows users to:

   - Design web pages without coding knowledge
   - Manage multiple projects
   - Preview designs across different device sizes

2. Provide a modern, responsive user interface that is:

   - Easy to navigate
   - Performance optimized
   - Visually appealing

3. Implement robust project management features:
   - Secure data storage
   - Efficient state management
   - Reliable user authentication

## Project Scope

1. Core Features

   - Visual editor with drag-and-drop interface
   - Component block system
   - Project management system
   - User authentication
   - Preview mode
   - Configuration sidebar

2. Technical Implementation

   - Next.js application with TypeScript
   - Supabase backend integration
   - State management with Zustand
   - UI components with shadcn/ui
   - Drag and drop with React DnD

3. Future Considerations
   - Rich text editing capabilities
   - Additional block types
   - Enhanced preview features
   - Export functionality

```

# memory-bank/systemPatterns.md

```md
# System Patterns

## System architecture

1. Frontend Architecture

   - Next.js App Router for routing and server components
   - React components for UI elements
   - Zustand for state management
   - TailwindCSS for styling

2. Backend Architecture

   - Supabase for authentication and data storage
   - Next.js API routes for server-side logic
   - Server-side rendering for improved performance

3. Data Flow
   - Client-side state management with Zustand
   - Server-side data persistence with Supabase
   - Real-time updates for collaborative features

## Key technical decisions

1. Framework Selection

   - Next.js for full-stack capabilities
   - React for component-based UI
   - TypeScript for type safety
   - Tailwind CSS for utility-first styling

2. State Management

   - Zustand for global state
   - React Context for theme/auth state
   - Local component state where appropriate

3. Data Storage
   - Supabase for user data and projects
   - Local storage for temporary states
   - Server-side caching for performance

## Design patterns in use

1. Component Patterns

   - Compound components for complex UI
   - Render props for flexible rendering
   - Higher-order components for shared functionality
   - Custom hooks for reusable logic

2. State Management Patterns

   - Observer pattern for state updates
   - Pub/sub for event handling
   - Command pattern for undo/redo
   - Factory pattern for component creation

3. UI Patterns
   - Controlled components for form inputs
   - Portal pattern for modals
   - Provider pattern for context
   - Composition pattern for layouts

## Component relationships

1. Editor Components

   \`\`\`
   Editor
   ├── Sidebar
   │   ├── ComponentLibrary
   │   └── PropertyPanel
   ├── Canvas
   │   ├── DropZone
   │   └── BlockRenderer
   └── Toolbar
       ├── Actions
       └── ViewControls
   \`\`\`

2. Block Components

   \`\`\`
   Block
   ├── BlockWrapper
   │   ├── DragHandle
   │   └── SelectionIndicator
   ├── BlockContent
   │   ├── TextBlock
   │   ├── ImageBlock
   │   └── ContainerBlock
   └── BlockControls
       ├── DeleteButton
       └── DuplicateButton
   \`\`\`

3. Authentication Flow
   \`\`\`
   AuthProvider
   ├── LoginForm
   ├── SignupForm
   └── AuthenticatedRoute
   \`\`\`

```

# memory-bank/techContext.md

```md
# Tech Context

## Technologies used

1. Core Framework

   - Next.js 14.2.25 (App Router)
   - React 18
   - TypeScript 5

2. UI Libraries

   - Tailwind CSS 3.4
   - shadcn/ui components
   - Radix UI primitives
   - Framer Motion for animations
   - Lucide React for icons

3. State Management

   - Zustand 5.0.3
   - React DnD 16.0.1
   - React DnD HTML5 Backend

4. Backend Services

   - Supabase Auth
   - Supabase Database
   - Next.js API Routes

5. Editor Features
   - TipTap for rich text editing
   - Emoji Picker React

## Development setup

1. Environment Requirements

   - Node.js
   - npm/yarn
   - Git

2. Project Setup

   \`\`\`bash
   git clone <repository>
   npm install
   cp .env.example .env.local
   # Configure Supabase credentials
   npm run dev
   \`\`\`

3. Development Commands
   - `npm run dev`: Start development server
   - `npm run build`: Build production version
   - `npm run start`: Start production server
   - `npm run lint`: Run ESLint

## Technical constraints

1. Browser Support

   - Modern browsers with HTML5 drag-and-drop
   - ES6+ JavaScript support
   - CSS Grid and Flexbox support

2. Performance Requirements

   - Fast initial page load
   - Smooth drag-and-drop operations
   - Efficient state updates
   - Responsive design support

3. Security Considerations
   - Secure authentication flow
   - Protected API routes
   - XSS prevention
   - CSRF protection

## Dependencies

1. Core Dependencies

   \`\`\`json
   {
     "next": "14.2.25",
     "react": "^18",
     "react-dom": "^18",
     "typescript": "^5"
   }
   \`\`\`

2. UI Dependencies

   \`\`\`json
   {
     "tailwindcss": "^3.4.17",
     "class-variance-authority": "^0.7.1",
     "clsx": "^2.1.1",
     "framer-motion": "^12.6.2",
     "lucide-react": "^0.485.0"
   }
   \`\`\`

3. State Management

   \`\`\`json
   {
     "zustand": "^5.0.3",
     "react-dnd": "^16.0.1",
     "react-dnd-html5-backend": "^16.0.1"
   }
   \`\`\`

4. Backend Dependencies
   \`\`\`json
   {
     "@supabase/auth-helpers-nextjs": "^0.10.0",
     "@supabase/ssr": "^0.6.1",
     "@supabase/supabase-js": "^2.49.4"
   }
   \`\`\`

```

# middleware.ts

```ts
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/editor')

  // If no session and trying to access protected route, redirect to auth page
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If we have a session and trying to access auth page, redirect to dashboard
  if (session && request.nextUrl.pathname === '/auth') {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * 
     * Also match specific protected routes:
     * - /dashboard routes
     * - /editor routes
     * - /auth route (for redirecting logged-in users)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    "/dashboard/:path*",
    "/editor/:path*",
    "/auth",
  ],
}


```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.matthias.lol",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

```

# package.json

```json
{
  "name": "boards-klon",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "list": "node scripts/dev.js list",
    "generate": "node scripts/dev.js generate",
    "parse-prd": "node scripts/dev.js parse-prd"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.49.4",
    "@tiptap-pro/extension-emoji": "^2.17.6",
    "@tiptap/core": "^2.11.7",
    "@tiptap/extension-color": "^2.11.7",
    "@tiptap/extension-link": "^2.11.7",
    "@tiptap/extension-text-style": "^2.11.7",
    "@tiptap/extension-underline": "^2.11.7",
    "@tiptap/pm": "^2.11.7",
    "@tiptap/react": "^2.11.7",
    "@tiptap/starter-kit": "^2.11.7",
    "@types/uuid": "^10.0.0",
    "boxen": "^7.1.1",
    "chalk": "^5.3.0",
    "class-variance-authority": "^0.7.1",
    "cli-table3": "^0.6.3",
    "clsx": "^2.1.1",
    "commander": "^11.1.0",
    "dotenv": "^16.3.1",
    "emoji-picker-react": "^4.12.2",
    "figlet": "^1.7.0",
    "framer-motion": "^12.6.2",
    "gradient-string": "^2.0.2",
    "lucide-react": "^0.485.0",
    "next": "14.2.25",
    "next-themes": "^0.4.6",
    "openai": "^4.86.1",
    "ora": "^7.0.1",
    "react": "^18",
    "react-colorful": "^5.6.1",
    "react-dom": "^18",
    "react-icons": "^5.5.0",
    "sonner": "^2.0.3",
    "supabase": "^2.20.12",
    "tailwind-merge": "^3.2.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.1.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.51.1",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/ui": "^3.1.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.25",
    "jsdom": "^26.0.0",
    "msw": "^2.7.3",
    "playwright": "^1.51.1",
    "postcss": "^8",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^3.1.1"
  },
  "type": "module"
}

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# public/images/auth-min.jpg

This is a binary file of the type: Image

# README-task-master.md

```md
# Task Master
### by [@eyaltoledano](https://x.com/eyaltoledano)

A task management system for AI-driven development with Claude, designed to work seamlessly with Cursor AI.

## Requirements

- Node.js 14.0.0 or higher
- Anthropic API key (Claude API)
- Anthropic SDK version 0.39.0 or higher
- OpenAI SDK (for Perplexity API integration, optional)

## Configuration

The script can be configured through environment variables in a `.env` file at the root of the project:

### Required Configuration
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

### Optional Configuration
- `MODEL`: Specify which Claude model to use (default: "claude-3-7-sonnet-20250219")
- `MAX_TOKENS`: Maximum tokens for model responses (default: 4000)
- `TEMPERATURE`: Temperature for model responses (default: 0.7)
- `PERPLEXITY_API_KEY`: Your Perplexity API key for research-backed subtask generation
- `PERPLEXITY_MODEL`: Specify which Perplexity model to use (default: "sonar-medium-online")
- `DEBUG`: Enable debug logging (default: false)
- `LOG_LEVEL`: Log level - debug, info, warn, error (default: info)
- `DEFAULT_SUBTASKS`: Default number of subtasks when expanding (default: 3)
- `DEFAULT_PRIORITY`: Default priority for generated tasks (default: medium)
- `PROJECT_NAME`: Override default project name in tasks.json
- `PROJECT_VERSION`: Override default version in tasks.json

## Installation

\`\`\`bash
# Install globally
npm install -g task-master-ai

# OR install locally within your project
npm install task-master-ai
\`\`\`

### Initialize a new project

\`\`\`bash
# If installed globally
task-master init

# If installed locally
npx task-master-init
\`\`\`

This will prompt you for project details and set up a new project with the necessary files and structure.

### Important Notes

1. This package uses ES modules. Your package.json should include `"type": "module"`.
2. The Anthropic SDK version should be 0.39.0 or higher.

## Quick Start with Global Commands

After installing the package globally, you can use these CLI commands from any directory:

\`\`\`bash
# Initialize a new project
task-master init

# Parse a PRD and generate tasks
task-master parse-prd your-prd.txt

# List all tasks
task-master list

# Show the next task to work on
task-master next

# Generate task files
task-master generate
\`\`\`

## Troubleshooting

### If `task-master init` doesn't respond:

Try running it with Node directly:

\`\`\`bash
node node_modules/claude-task-master/scripts/init.js
\`\`\`

Or clone the repository and run:

\`\`\`bash
git clone https://github.com/eyaltoledano/claude-task-master.git
cd claude-task-master
node scripts/init.js
\`\`\`

## Task Structure

Tasks in tasks.json have the following structure:

- `id`: Unique identifier for the task (Example: `1`)
- `title`: Brief, descriptive title of the task (Example: `"Initialize Repo"`)
- `description`: Concise description of what the task involves (Example: `"Create a new repository, set up initial structure."`)
- `status`: Current state of the task (Example: `"pending"`, `"done"`, `"deferred"`)
- `dependencies`: IDs of tasks that must be completed before this task (Example: `[1, 2]`)
  - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending)
  - This helps quickly identify which prerequisite tasks are blocking work
- `priority`: Importance level of the task (Example: `"high"`, `"medium"`, `"low"`)
- `details`: In-depth implementation instructions (Example: `"Use GitHub client ID/secret, handle callback, set session token."`)
- `testStrategy`: Verification approach (Example: `"Deploy and call endpoint to confirm 'Hello World' response."`)
- `subtasks`: List of smaller, more specific tasks that make up the main task (Example: `[{"id": 1, "title": "Configure OAuth", ...}]`)

## Integrating with Cursor AI

Claude Task Master is designed to work seamlessly with [Cursor AI](https://www.cursor.so/), providing a structured workflow for AI-driven development.

### Setup with Cursor

1. After initializing your project, open it in Cursor
2. The `.cursor/rules/dev_workflow.mdc` file is automatically loaded by Cursor, providing the AI with knowledge about the task management system
3. Place your PRD document in the `scripts/` directory (e.g., `scripts/prd.txt`)
4. Open Cursor's AI chat and switch to Agent mode

### Initial Task Generation

In Cursor's AI chat, instruct the agent to generate tasks from your PRD:

\`\`\`
Please use the task-master parse-prd command to generate tasks from my PRD. The PRD is located at scripts/prd.txt.
\`\`\`

The agent will execute:
\`\`\`bash
task-master parse-prd scripts/prd.txt
\`\`\`

This will:
- Parse your PRD document
- Generate a structured `tasks.json` file with tasks, dependencies, priorities, and test strategies
- The agent will understand this process due to the Cursor rules

### Generate Individual Task Files

Next, ask the agent to generate individual task files:

\`\`\`
Please generate individual task files from tasks.json
\`\`\`

The agent will execute:
\`\`\`bash
task-master generate
\`\`\`

This creates individual task files in the `tasks/` directory (e.g., `task_001.txt`, `task_002.txt`), making it easier to reference specific tasks.

## AI-Driven Development Workflow

The Cursor agent is pre-configured (via the rules file) to follow this workflow:

### 1. Task Discovery and Selection

Ask the agent to list available tasks:

\`\`\`
What tasks are available to work on next?
\`\`\`

The agent will:
- Run `task-master list` to see all tasks
- Run `task-master next` to determine the next task to work on
- Analyze dependencies to determine which tasks are ready to be worked on
- Prioritize tasks based on priority level and ID order
- Suggest the next task(s) to implement

### 2. Task Implementation

When implementing a task, the agent will:
- Reference the task's details section for implementation specifics
- Consider dependencies on previous tasks
- Follow the project's coding standards
- Create appropriate tests based on the task's testStrategy

You can ask:
\`\`\`
Let's implement task 3. What does it involve?
\`\`\`

### 3. Task Verification

Before marking a task as complete, verify it according to:
- The task's specified testStrategy
- Any automated tests in the codebase
- Manual verification if required

### 4. Task Completion

When a task is completed, tell the agent:

\`\`\`
Task 3 is now complete. Please update its status.
\`\`\`

The agent will execute:
\`\`\`bash
task-master set-status --id=3 --status=done
\`\`\`

### 5. Handling Implementation Drift

If during implementation, you discover that:
- The current approach differs significantly from what was planned
- Future tasks need to be modified due to current implementation choices
- New dependencies or requirements have emerged

Tell the agent:
\`\`\`
We've changed our approach. We're now using Express instead of Fastify. Please update all future tasks to reflect this change.
\`\`\`

The agent will execute:
\`\`\`bash
task-master update --from=4 --prompt="Now we are using Express instead of Fastify."
\`\`\`

This will rewrite or re-scope subsequent tasks in tasks.json while preserving completed work.

### 6. Breaking Down Complex Tasks

For complex tasks that need more granularity:

\`\`\`
Task 5 seems complex. Can you break it down into subtasks?
\`\`\`

The agent will execute:
\`\`\`bash
task-master expand --id=5 --num=3
\`\`\`

You can provide additional context:
\`\`\`
Please break down task 5 with a focus on security considerations.
\`\`\`

The agent will execute:
\`\`\`bash
task-master expand --id=5 --prompt="Focus on security aspects"
\`\`\`

You can also expand all pending tasks:
\`\`\`
Please break down all pending tasks into subtasks.
\`\`\`

The agent will execute:
\`\`\`bash
task-master expand --all
\`\`\`

For research-backed subtask generation using Perplexity AI:
\`\`\`
Please break down task 5 using research-backed generation.
\`\`\`

The agent will execute:
\`\`\`bash
task-master expand --id=5 --research
\`\`\`

## Command Reference

Here's a comprehensive reference of all available commands:

### Parse PRD
\`\`\`bash
# Parse a PRD file and generate tasks
task-master parse-prd <prd-file.txt>

# Limit the number of tasks generated
task-master parse-prd <prd-file.txt> --num-tasks=10
\`\`\`

### List Tasks
\`\`\`bash
# List all tasks
task-master list

# List tasks with a specific status
task-master list --status=<status>

# List tasks with subtasks
task-master list --with-subtasks

# List tasks with a specific status and include subtasks
task-master list --status=<status> --with-subtasks
\`\`\`

### Show Next Task
\`\`\`bash
# Show the next task to work on based on dependencies and status
task-master next
\`\`\`

### Show Specific Task
\`\`\`bash
# Show details of a specific task
task-master show <id>
# or
task-master show --id=<id>

# View a specific subtask (e.g., subtask 2 of task 1)
task-master show 1.2
\`\`\`

### Update Tasks
\`\`\`bash
# Update tasks from a specific ID and provide context
task-master update --from=<id> --prompt="<prompt>"
\`\`\`

### Generate Task Files
\`\`\`bash
# Generate individual task files from tasks.json
task-master generate
\`\`\`

### Set Task Status
\`\`\`bash
# Set status of a single task
task-master set-status --id=<id> --status=<status>

# Set status for multiple tasks
task-master set-status --id=1,2,3 --status=<status>

# Set status for subtasks
task-master set-status --id=1.1,1.2 --status=<status>
\`\`\`

When marking a task as "done", all of its subtasks will automatically be marked as "done" as well.

### Expand Tasks
\`\`\`bash
# Expand a specific task with subtasks
task-master expand --id=<id> --num=<number>

# Expand with additional context
task-master expand --id=<id> --prompt="<context>"

# Expand all pending tasks
task-master expand --all

# Force regeneration of subtasks for tasks that already have them
task-master expand --all --force

# Research-backed subtask generation for a specific task
task-master expand --id=<id> --research

# Research-backed generation for all tasks
task-master expand --all --research
\`\`\`

### Clear Subtasks
\`\`\`bash
# Clear subtasks from a specific task
task-master clear-subtasks --id=<id>

# Clear subtasks from multiple tasks
task-master clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
task-master clear-subtasks --all
\`\`\`

### Analyze Task Complexity
\`\`\`bash
# Analyze complexity of all tasks
task-master analyze-complexity

# Save report to a custom location
task-master analyze-complexity --output=my-report.json

# Use a specific LLM model
task-master analyze-complexity --model=claude-3-opus-20240229

# Set a custom complexity threshold (1-10)
task-master analyze-complexity --threshold=6

# Use an alternative tasks file
task-master analyze-complexity --file=custom-tasks.json

# Use Perplexity AI for research-backed complexity analysis
task-master analyze-complexity --research
\`\`\`

### View Complexity Report
\`\`\`bash
# Display the task complexity analysis report
task-master complexity-report

# View a report at a custom location
task-master complexity-report --file=my-report.json
\`\`\`

### Managing Task Dependencies
\`\`\`bash
# Add a dependency to a task
task-master add-dependency --id=<id> --depends-on=<id>

# Remove a dependency from a task
task-master remove-dependency --id=<id> --depends-on=<id>

# Validate dependencies without fixing them
task-master validate-dependencies

# Find and fix invalid dependencies automatically
task-master fix-dependencies
\`\`\`

### Add a New Task
\`\`\`bash
# Add a new task using AI
task-master add-task --prompt="Description of the new task"

# Add a task with dependencies
task-master add-task --prompt="Description" --dependencies=1,2,3

# Add a task with priority
task-master add-task --prompt="Description" --priority=high
\`\`\`

## Feature Details

### Analyzing Task Complexity

The `analyze-complexity` command:
- Analyzes each task using AI to assess its complexity on a scale of 1-10
- Recommends optimal number of subtasks based on configured DEFAULT_SUBTASKS
- Generates tailored prompts for expanding each task
- Creates a comprehensive JSON report with ready-to-use commands
- Saves the report to scripts/task-complexity-report.json by default

The generated report contains:
- Complexity analysis for each task (scored 1-10)
- Recommended number of subtasks based on complexity
- AI-generated expansion prompts customized for each task
- Ready-to-run expansion commands directly within each task analysis

### Viewing Complexity Report

The `complexity-report` command:
- Displays a formatted, easy-to-read version of the complexity analysis report
- Shows tasks organized by complexity score (highest to lowest)
- Provides complexity distribution statistics (low, medium, high)
- Highlights tasks recommended for expansion based on threshold score
- Includes ready-to-use expansion commands for each complex task
- If no report exists, offers to generate one on the spot

### Smart Task Expansion

The `expand` command automatically checks for and uses the complexity report:

When a complexity report exists:
- Tasks are automatically expanded using the recommended subtask count and prompts
- When expanding all tasks, they're processed in order of complexity (highest first)
- Research-backed generation is preserved from the complexity analysis
- You can still override recommendations with explicit command-line options

Example workflow:
\`\`\`bash
# Generate the complexity analysis report with research capabilities
task-master analyze-complexity --research

# Review the report in a readable format
task-master complexity-report

# Expand tasks using the optimized recommendations
task-master expand --id=8
# or expand all tasks
task-master expand --all
\`\`\`

### Finding the Next Task

The `next` command:
- Identifies tasks that are pending/in-progress and have all dependencies satisfied
- Prioritizes tasks by priority level, dependency count, and task ID
- Displays comprehensive information about the selected task:
  - Basic task details (ID, title, priority, dependencies)
  - Implementation details
  - Subtasks (if they exist)
- Provides contextual suggested actions:
  - Command to mark the task as in-progress
  - Command to mark the task as done
  - Commands for working with subtasks

### Viewing Specific Task Details

The `show` command:
- Displays comprehensive details about a specific task or subtask
- Shows task status, priority, dependencies, and detailed implementation notes
- For parent tasks, displays all subtasks and their status
- For subtasks, shows parent task relationship
- Provides contextual action suggestions based on the task's state
- Works with both regular tasks and subtasks (using the format taskId.subtaskId)

## Best Practices for AI-Driven Development

1. **Start with a detailed PRD**: The more detailed your PRD, the better the generated tasks will be.

2. **Review generated tasks**: After parsing the PRD, review the tasks to ensure they make sense and have appropriate dependencies.

3. **Analyze task complexity**: Use the complexity analysis feature to identify which tasks should be broken down further.

4. **Follow the dependency chain**: Always respect task dependencies - the Cursor agent will help with this.

5. **Update as you go**: If your implementation diverges from the plan, use the update command to keep future tasks aligned with your current approach.

6. **Break down complex tasks**: Use the expand command to break down complex tasks into manageable subtasks.

7. **Regenerate task files**: After any updates to tasks.json, regenerate the task files to keep them in sync.

8. **Communicate context to the agent**: When asking the Cursor agent to help with a task, provide context about what you're trying to achieve.

9. **Validate dependencies**: Periodically run the validate-dependencies command to check for invalid or circular dependencies.

## Example Cursor AI Interactions

### Starting a new project
\`\`\`
I've just initialized a new project with Claude Task Master. I have a PRD at scripts/prd.txt. 
Can you help me parse it and set up the initial tasks?
\`\`\`

### Working on tasks
\`\`\`
What's the next task I should work on? Please consider dependencies and priorities.
\`\`\`

### Implementing a specific task
\`\`\`
I'd like to implement task 4. Can you help me understand what needs to be done and how to approach it?
\`\`\`

### Managing subtasks
\`\`\`
I need to regenerate the subtasks for task 3 with a different approach. Can you help me clear and regenerate them?
\`\`\`

### Handling changes
\`\`\`
We've decided to use MongoDB instead of PostgreSQL. Can you update all future tasks to reflect this change?
\`\`\`

### Completing work
\`\`\`
I've finished implementing the authentication system described in task 2. All tests are passing. 
Please mark it as complete and tell me what I should work on next.
\`\`\`

### Analyzing complexity
\`\`\`
Can you analyze the complexity of our tasks to help me understand which ones need to be broken down further?
\`\`\`

### Viewing complexity report
\`\`\`
Can you show me the complexity report in a more readable format?
\`\`\`
```

# README.md

```md
# Boards Klon - Visual Web Builder

Boards Klon is a web application that allows users to visually build web pages or layouts using a drag-and-drop interface. It's built with modern web technologies, enabling users to create, manage, and preview their projects.

## Key Features

- **Visual Editor:** Drag-and-drop blocks onto a canvas to build layouts.
- **Component Blocks:** Use predefined blocks (like headings, paragraphs, etc.) to structure content.
- **Configuration:** Select blocks on the canvas to configure their properties via a right sidebar.
- **Preview Mode:** View the created layout in different viewport sizes (desktop, tablet, mobile).
- **Project Management:** Create, save, and load projects associated with user accounts.
- **Authentication:** User accounts managed via Supabase.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Backend & Database:** [Supabase](https://supabase.io/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Drag & Drop:** [React DnD](https://react-dnd.github.io/react-dnd/about)
- **(Potential) Rich Text Editing:** [Tiptap](https://tiptap.dev/)

## Project Structure

- `app/`: Contains the core application routes and pages (Next.js App Router).
  - `app/auth/`: Authentication pages and logic.
  - `app/dashboard/`: User dashboard for managing projects.
  - `app/editor/`: The main visual editor interface.
- `components/`: Reusable React components.
  - `components/blocks/`: Components representing draggable content blocks.
  - `components/canvas/`: Components related to the editor canvas and drop areas.
  - `components/layout/`: Layout components (Navbar, Sidebars).
  - `components/preview/`: Components for the preview mode.
  - `components/ui/`: UI primitives (likely from shadcn/ui).
- `lib/`: Utility functions, hooks, constants, and Supabase client setup.
- `store/`: Zustand stores for managing application state (blocks, editor UI).
- `styles/`: Global styles.

## Learn More about Dependencies

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React DnD Documentation](https://react-dnd.github.io/react-dnd/about)

```

# scripts/dev.js

```js
#!/usr/bin/env node

/**
 * dev.js
 * Task Master CLI - AI-driven development task management
 * 
 * This is the refactored entry point that uses the modular architecture.
 * It imports functionality from the modules directory and provides a CLI.
 */

// Add at the very beginning of the file
if (process.env.DEBUG === '1') {
  console.error('DEBUG - dev.js received args:', process.argv.slice(2));
}

import { runCLI } from './modules/commands.js';

// Run the CLI with the process arguments
runCLI(process.argv); 
```

# scripts/example_prd.txt

```txt
<context>
# Overview  
[Provide a high-level overview of your product here. Explain what problem it solves, who it's for, and why it's valuable.]

# Core Features  
[List and describe the main features of your product. For each feature, include:
- What it does
- Why it's important
- How it works at a high level]

# User Experience  
[Describe the user journey and experience. Include:
- User personas
- Key user flows
- UI/UX considerations]
</context>
<PRD>
# Technical Architecture  
[Outline the technical implementation details:
- System components
- Data models
- APIs and integrations
- Infrastructure requirements]

# Development Roadmap  
[Break down the development process into phases:
- MVP requirements
- Future enhancements
- Do not think about timelines whatsoever -- all that matters is scope and detailing exactly what needs to be build in each phase so it can later be cut up into tasks]

# Logical Dependency Chain
[Define the logical order of development:
- Which features need to be built first (foundation)
- Getting as quickly as possible to something usable/visible front end that works
- Properly pacing and scoping each feature so it is atomic but can also be built upon and improved as development approaches]

# Risks and Mitigations  
[Identify potential risks and how they'll be addressed:
- Technical challenges
- Figuring out the MVP that we can build upon
- Resource constraints]

# Appendix  
[Include any additional information:
- Research findings
- Technical specifications]
</PRD>
```

# scripts/prd.txt

```txt
**Product Requirements Document: Block Builder**

**1. Introduction**

The NextJS WebApp (i have no name yet) is a visual drag and drop development tool designed to empower users to create "board" page layouts through an intuitive drag-and-drop interface. It utilizes a component-based system where users can assemble predefined "blocks" (like headings, paragraphs, images) onto a canvas, configure their properties, and preview the result across different device sizes. The application leverages Next.js for the frontend framework and Supabase for backend services including authentication, database storage (for media items), and file storage (for project data and media files).

**2. Goals**

- **Intuitive Visual Building:** Provide a seamless drag-and-drop experience for constructing web layouts without requiring direct coding knowledge.
- **Component-Based Design:** Enable users to build pages using reusable, configurable blocks.
- **Responsive Previews:** Allow users to easily visualize how their creations will look on desktop, tablet, and mobile devices.
- **User Project Management:** Offer secure user accounts for creating, saving, loading, and managing multiple web layout projects.
- **Media Management:** Provide a central library for users to upload, view, and manage media assets (images, videos, audio, documents) for use within their projects.

**3. Target Audience**

- Users seeking a visual way to create board page layouts without extensive coding.
- These users typically are sales persons who want to give their customers condensed information about a product or service they offer

**4. Features & User Stories**

**4.1. Authentication & User Management**

- **As a new user, I can:**
  - Sign up for an account using my email via a Magic Link (`signUp` action).
  - Sign up using Google OAuth.
  - Sign up using Apple OAuth.
- **As a returning user, I can:**
  - Sign in to my account using my email via a Magic Link (`signIn` action).
  - Sign in using Google OAuth.
  - Sign in using Apple OAuth.
- **As an authenticated user, I can:**
  - Be redirected to the appropriate page (e.g., dashboard) after successful authentication (`auth/callback/route.ts`).
  - Sign out of my account (`signOut` action).
  - Access protected routes like `/dashboard` and `/editor` (`middleware.ts`).
  - Be redirected away from authentication pages (`/sign-in`, `/sign-up`) if already logged in.
- **As any user, I can:**
  - See clear feedback (success/error messages, loading states) during the authentication process (`sign-in/page.tsx`, `sign-up/page.tsx`).

**4.2. Dashboard**

- **As an authenticated user, I can:**
  - Access a dashboard page (`/dashboard`).
  - View a list of my saved projects, displayed as cards (`ProjectsView`, `ProjectCard`, `listProjectsFromStorage`).
  - See basic project information on each card (title, last updated/created date) (`ProjectCard`, `formatDate`).
  - Search for projects by title (`ProjectsView`, `Input`).
  - Filter projects using tabs (All, Recent, Templates - functionality might be placeholder) (`ProjectsView`, `Tabs`).
  - Click a "New Project" button to navigate to the editor (`ProjectsView`, `Button`).
  - Click on a project card to open it in the editor (`ProjectsView`, `ProjectCard`, navigation to `/editor?projectId=...`).
  - Delete a project, which includes a confirmation dialog (`ProjectCard`, `AlertDialog`, `deleteProjectFromStorage`, `deleteProjectFromDatabase`).
  - Manually refresh the project list (`ProjectsView`, `Button`).
  - Navigate between different dashboard sections (Projects, Mediathek, Analytics, Profile, Settings) using a persistent sidebar (`DashboardSidebar`, `dashboard/page.tsx`).
  - View placeholder sections for Analytics, Profile, and Settings (`AnalyticsView`, `ProfileView`, `SettingsView`).
  - See my user avatar and email in the sidebar (`DashboardSidebar`).

**4.3. Editor - Core Interface**

- **As a user, I can:**
  - Access the main editor interface (`/editor`).
  - View a layout consisting of a Left Sidebar (Blocks/Templates), a central Canvas, and a Right Sidebar (Properties/Media) (`editor/page.tsx`).
  - Load a specific project by providing its `projectId` in the URL (`editor/page.tsx`, `useBlocksStore.loadProject`).
  - Automatically have a new, unsaved project created if no `projectId` is provided (`editor/page.tsx`, `useBlocksStore.createNewProject`).
  - See the current project's title in the Navbar (`Navbar`, `useBlocksStore.currentProjectTitle`).
  - Click the project title in the Navbar to edit it inline (`Navbar`, `Input`, `useBlocksStore.setProjectTitle`).
  - Switch the canvas preview between Desktop, Tablet, and Mobile viewports using selectors (`ViewportSelector`, `useViewport`).
  - Toggle a Preview Mode to see a clean representation of the layout (`Canvas`, `Preview`, `useBlocksStore.setPreviewMode`).
  - Navigate back to the Dashboard from the editor (`Navbar`).

**4.4. Editor - Canvas & Blocks**

- **As a user, I can:**
  - See a library of available blocks (Heading, Paragraph, Image, Video, Audio, Document, Button, Form, Divider) in the Left Sidebar (`LeftSidebar`, `DraggableBlock`).
  - Drag a block from the Left Sidebar onto the Canvas Drop Areas (`useDropArea`, `ItemTypes.BLOCK`).
  - See blocks rendered visually on the canvas after dropping (`Canvas`, `DropArea`, `CanvasBlock`).
  - Drag an existing block on the canvas to reorder it within its current Drop Area (`useBlockDrag`, `DropAreaContent` internal `useDrop`, `useBlocksStore.reorderBlocks`).
  - Drag an existing block from one Drop Area and drop it into another Drop Area (`useBlockDrag`, `useDropArea`, `useBlocksStore.moveBlock`).
  - See insertion indicators when dragging blocks between other blocks or into gaps between Drop Areas (`InsertionIndicator`, `Canvas` gap drop logic).
  - See visual feedback (highlighting, opacity changes) when dragging blocks or hovering over drop zones (`useDropArea`, `useBlockDrag`, `DropAreaContent`).
  - Click on a block on the canvas to select it (`CanvasBlock`, `useBlocksStore.selectBlock`), indicated by a border/ring.
  - Hover over a block to see controls (Move handle, Delete button) (`CanvasBlock`).
  - Delete a block using its delete button (only appears if it's not the only block in its area) (`CanvasBlock`, `useBlocksStore.deleteBlock`).
  - Delete an entire Drop Area (if it contains blocks) using a delete button that appears on hover (`DropArea`, `DesktopDropArea`, etc., `useBlocksStore.deleteDropArea`).
  - Split an _empty_ Drop Area horizontally by clicking a '+' indicator that appears on hover (behavior depends on viewport limits) (`DropArea`, `useBlocksStore.splitDropArea`, `canSplit`).
  - Split a _populated_ Drop Area horizontally by clicking a '+' indicator (moves existing blocks to the first new area) (`DropArea`, `useBlocksStore.splitPopulatedDropArea`, `canSplit`).
  - Merge two adjacent, compatible (e.g., one empty or both having same parent) Drop Areas by clicking a merge indicator in the gap between them (`DesktopDropArea`, `TabletDropArea`, `MobileDropArea`, `MergeGapIndicator`, `useBlocksStore.mergeDropAreas`, `canMerge`).

**4.5. Editor - Block Content & Configuration**

- **As a user, I can:**
  - Edit the text content of Heading and Paragraph blocks directly on the canvas using a Tiptap-based rich text editor (`HeadingBlock`, `ParagraphBlock`, `useEditor`).
  - Format text within Heading/Paragraph blocks using a toolbar (Bold, Italic, Underline, Link, Lists, Blockquote, Horizontal Rule, Emoji) (`HeadingBlock`, `ParagraphBlock`, `TiptapToolbar`).
  - Change the level (H1-H6) of a Heading block using its toolbar (`HeadingBlock`).
  - Change the text color of a Heading block using a color picker in its toolbar (`HeadingBlock`, `ColorPicker`).
  - Add an image to an Image block by dropping an image file directly onto it (`ImageBlock`, `useDrop`, `NativeTypes.FILE`). The image is uploaded to Supabase Storage and added to the `media_items` table.
  - (Implied) Drag an image from the Mediathek (Right Sidebar) onto an Image block (`ImageBlock`, `useDrop`, `ItemTypes.MEDIA_IMAGE`).
  - See loading and error states within the Image block during upload/loading (`ImageBlock`).
  - (Implied) Configure properties of the _selected_ block using the Right Sidebar (structure exists, URL/Alt text for Image block is conceptually shown in `image.md`).
  - Directly drop a supported media file (Image, Video, Audio, Document) onto any DropArea (empty or between blocks) to automatically create the corresponding block (`useDropArea`, `DropAreaContent` - Requires implementation as requested).

**4.6. Editor - Project Saving & Loading**

- **As a user, I can:**
  - Have my project automatically saved periodically if Auto-Save is enabled (`useBlocksStore.autoSaveEnabled`, `triggerAutoSave`, debounced save).
  - Toggle the Auto-Save feature on/off (`Navbar`, `useBlocksStore.toggleAutoSave`).
  - Manually save the current project using a "Save" button (`Navbar`, `useBlocksStore.saveProject`).
  - See the status of the save operation (Idle, Saving, Saved, Error) (`Navbar`).
  - See an indicator of when the project was last successfully saved (`Navbar`, `useBlocksStore.lastSaved`).
  - Have my project data (title, description, block structure) persisted in Supabase Storage (`saveProjectToStorage`, `loadProjectFromStorage`).
  - Delete the currently open project using a "Delete" button in the Navbar (`Navbar`, `deleteProjectFromStorage`, `deleteProjectFromDatabase`).

**4.7. Mediathek (Standalone View)**

- **As an authenticated user, I can:**
  - Access a dedicated Mediathek page (`/mediathek` or via Dashboard sidebar).
  - View all my uploaded media files, grouped by type (Images, Videos, Audio, Documents) (`MediathekView`).
  - Search for media files by filename (`MediathekView`, `Input`).
  - Upload new media files via drag-and-drop or a file selector (`MediathekView`, `handleFileUpload`). Uploaded files are stored in the appropriate Supabase bucket (`images`, `videos`, etc.) and recorded in the `media_items` table.
  - See upload progress (`MediathekView`).
  - Delete media items from the library (removes from storage and database) (`MediathekView`, `handleDelete`).

**4.8. Mediathek (Editor Sidebar Tab)**

- **As a user, I can:**
  - Access a Mediathek tab within the Editor's Right Sidebar (`EditorRightSidebar`, `MediaLibraryContent`).
  - View, search, upload, and delete media items similarly to the standalone Mediathek view, powered by Supabase (`MediaLibraryContent`).
  - (Implied) Drag media items (specifically images currently) from this tab onto compatible blocks on the canvas (e.g., `ImageBlock`).

**5. Design & UI/UX Considerations**

- The UI should be clean, intuitive, and consistent, leveraging Tailwind CSS and shadcn/ui components.
- Drag-and-drop interactions should feel smooth and provide clear visual feedback (hover states, insertion indicators, drag previews).
- The application must be responsive, adapting the editor and preview correctly for desktop, tablet, and mobile viewports.
- Loading states should be clearly indicated during data fetching (projects, media) and saving/uploading operations.
- Error states should be handled gracefully with informative messages (e.g., using toasts via `sonner`).

**6. MVP Release Criteria (Based on Current Implementation)**

- Stable user authentication (Magic Link, OAuth).
- Functional Dashboard: Project listing, creation, loading, deletion.
- Core Editor: Load/Save projects, add/move/delete basic blocks (Heading, Paragraph, Image), viewport switching, preview mode.
- Image Block: File drop upload to Supabase, rendering from URL.
- other Media Blocks: File drop upload to Supabase, rendering from URL
- Mediathek: View, upload, delete media items (syncing with Supabase).
- Basic Drag-and-Drop functionality for blocks (within/between areas).
- Basic Split/Merge functionality for Drop Areas.

**7. Future Considerations / To be implemented (From Memory Bank / Code)**

- Full implementation and configuration options for all planned block types (Button, Form, Divider, Video, Audio, Document).
- Project share/export functionality => export to prerenderd and sharable HTML site (e.g. https://blockbuilder.com/board/u127sdf37832) or as an eMail Template.
- Collaboration features.
- Implementation of Analytics, Profile, and Settings dashboard views.
- Formal testing suite (Unit, Integration, E2E).
- Theme switching (Light/Dark/System - UI exists in SettingsView).
- Internationalization/Language selection (UI exists in SettingsView).

**8. Open Questions/Assumptions**

- How should non-image blocks (Video, Audio, Document) be rendered and configured?
- What specific properties are configurable for each block type beyond basic content?
- What are the exact rules/limitations for splitting/merging Drop Areas across different viewports and nesting levels? (Current implementation has some viewport-specific limits).
- How is project thumbnail generation/selection handled? (Functions exist but integration point isn't fully clear).
- What is the intended functionality of the "Recent" and "Templates" tabs on the dashboard?

```

# scripts/README-task-master.md

```md
# Meta-Development Script

This folder contains a **meta-development script** (`dev.js`) and related utilities that manage tasks for an AI-driven or traditional software development workflow. The script revolves around a `tasks.json` file, which holds an up-to-date list of development tasks.

## Overview

In an AI-driven development process—particularly with tools like [Cursor](https://www.cursor.so/)—it's beneficial to have a **single source of truth** for tasks. This script allows you to:

1. **Parse** a PRD or requirements document (`.txt`) to initialize a set of tasks (`tasks.json`).
2. **List** all existing tasks (IDs, statuses, titles).
3. **Update** tasks to accommodate new prompts or architecture changes (useful if you discover "implementation drift").
4. **Generate** individual task files (e.g., `task_001.txt`) for easy reference or to feed into an AI coding workflow.
5. **Set task status**—mark tasks as `done`, `pending`, or `deferred` based on progress.
6. **Expand** tasks with subtasks—break down complex tasks into smaller, more manageable subtasks.
7. **Research-backed subtask generation**—use Perplexity AI to generate more informed and contextually relevant subtasks.
8. **Clear subtasks**—remove subtasks from specified tasks to allow regeneration or restructuring.
9. **Show task details**—display detailed information about a specific task and its subtasks.

## Configuration

The script can be configured through environment variables in a `.env` file at the root of the project:

### Required Configuration
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

### Optional Configuration
- `MODEL`: Specify which Claude model to use (default: "claude-3-7-sonnet-20250219")
- `MAX_TOKENS`: Maximum tokens for model responses (default: 4000)
- `TEMPERATURE`: Temperature for model responses (default: 0.7)
- `PERPLEXITY_API_KEY`: Your Perplexity API key for research-backed subtask generation
- `PERPLEXITY_MODEL`: Specify which Perplexity model to use (default: "sonar-medium-online")
- `DEBUG`: Enable debug logging (default: false)
- `LOG_LEVEL`: Log level - debug, info, warn, error (default: info)
- `DEFAULT_SUBTASKS`: Default number of subtasks when expanding (default: 3)
- `DEFAULT_PRIORITY`: Default priority for generated tasks (default: medium)
- `PROJECT_NAME`: Override default project name in tasks.json
- `PROJECT_VERSION`: Override default version in tasks.json

## How It Works

1. **`tasks.json`**:  
   - A JSON file at the project root containing an array of tasks (each with `id`, `title`, `description`, `status`, etc.).  
   - The `meta` field can store additional info like the project's name, version, or reference to the PRD.  
   - Tasks can have `subtasks` for more detailed implementation steps.
   - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending) to easily track progress.

2. **CLI Commands**  
   You can run the commands via:

   \`\`\`bash
   # If installed globally
   task-master [command] [options]
   
   # If using locally within the project
   node scripts/dev.js [command] [options]
   \`\`\`

   Available commands:

   - `init`: Initialize a new project
   - `parse-prd`: Generate tasks from a PRD document
   - `list`: Display all tasks with their status
   - `update`: Update tasks based on new information
   - `generate`: Create individual task files
   - `set-status`: Change a task's status
   - `expand`: Add subtasks to a task or all tasks
   - `clear-subtasks`: Remove subtasks from specified tasks
   - `next`: Determine the next task to work on based on dependencies
   - `show`: Display detailed information about a specific task
   - `analyze-complexity`: Analyze task complexity and generate recommendations
   - `complexity-report`: Display the complexity analysis in a readable format
   - `add-dependency`: Add a dependency between tasks
   - `remove-dependency`: Remove a dependency from a task
   - `validate-dependencies`: Check for invalid dependencies
   - `fix-dependencies`: Fix invalid dependencies automatically
   - `add-task`: Add a new task using AI

   Run `task-master --help` or `node scripts/dev.js --help` to see detailed usage information.

## Listing Tasks

The `list` command allows you to view all tasks and their status:

\`\`\`bash
# List all tasks
task-master list

# List tasks with a specific status
task-master list --status=pending

# List tasks and include their subtasks
task-master list --with-subtasks

# List tasks with a specific status and include their subtasks
task-master list --status=pending --with-subtasks
\`\`\`

## Updating Tasks

The `update` command allows you to update tasks based on new information or implementation changes:

\`\`\`bash
# Update tasks starting from ID 4 with a new prompt
task-master update --from=4 --prompt="Refactor tasks from ID 4 onward to use Express instead of Fastify"

# Update all tasks (default from=1)
task-master update --prompt="Add authentication to all relevant tasks"

# Specify a different tasks file
task-master update --file=custom-tasks.json --from=5 --prompt="Change database from MongoDB to PostgreSQL"
\`\`\`

Notes:
- The `--prompt` parameter is required and should explain the changes or new context
- Only tasks that aren't marked as 'done' will be updated
- Tasks with ID >= the specified --from value will be updated

## Setting Task Status

The `set-status` command allows you to change a task's status:

\`\`\`bash
# Mark a task as done
task-master set-status --id=3 --status=done

# Mark a task as pending
task-master set-status --id=4 --status=pending

# Mark a specific subtask as done
task-master set-status --id=3.1 --status=done

# Mark multiple tasks at once
task-master set-status --id=1,2,3 --status=done
\`\`\`

Notes:
- When marking a parent task as "done", all of its subtasks will automatically be marked as "done" as well
- Common status values are 'done', 'pending', and 'deferred', but any string is accepted
- You can specify multiple task IDs by separating them with commas
- Subtask IDs are specified using the format `parentId.subtaskId` (e.g., `3.1`)
- Dependencies are updated to show completion status (✅ for completed, ⏱️ for pending) throughout the system

## Expanding Tasks

The `expand` command allows you to break down tasks into subtasks for more detailed implementation:

\`\`\`bash
# Expand a specific task with 3 subtasks (default)
task-master expand --id=3

# Expand a specific task with 5 subtasks
task-master expand --id=3 --num=5

# Expand a task with additional context
task-master expand --id=3 --prompt="Focus on security aspects"

# Expand all pending tasks that don't have subtasks
task-master expand --all

# Force regeneration of subtasks for all pending tasks
task-master expand --all --force

# Use Perplexity AI for research-backed subtask generation
task-master expand --id=3 --research

# Use Perplexity AI for research-backed generation on all pending tasks
task-master expand --all --research
\`\`\`

## Clearing Subtasks

The `clear-subtasks` command allows you to remove subtasks from specified tasks:

\`\`\`bash
# Clear subtasks from a specific task
task-master clear-subtasks --id=3

# Clear subtasks from multiple tasks
task-master clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
task-master clear-subtasks --all
\`\`\`

Notes:
- After clearing subtasks, task files are automatically regenerated
- This is useful when you want to regenerate subtasks with a different approach
- Can be combined with the `expand` command to immediately generate new subtasks
- Works with both parent tasks and individual subtasks

## AI Integration

The script integrates with two AI services:

1. **Anthropic Claude**: Used for parsing PRDs, generating tasks, and creating subtasks.
2. **Perplexity AI**: Used for research-backed subtask generation when the `--research` flag is specified.

The Perplexity integration uses the OpenAI client to connect to Perplexity's API, which provides enhanced research capabilities for generating more informed subtasks. If the Perplexity API is unavailable or encounters an error, the script will automatically fall back to using Anthropic's Claude.

To use the Perplexity integration:
1. Obtain a Perplexity API key
2. Add `PERPLEXITY_API_KEY` to your `.env` file
3. Optionally specify `PERPLEXITY_MODEL` in your `.env` file (default: "sonar-medium-online")
4. Use the `--research` flag with the `expand` command

## Logging

The script supports different logging levels controlled by the `LOG_LEVEL` environment variable:
- `debug`: Detailed information, typically useful for troubleshooting
- `info`: Confirmation that things are working as expected (default)
- `warn`: Warning messages that don't prevent execution
- `error`: Error messages that might prevent execution

When `DEBUG=true` is set, debug logs are also written to a `dev-debug.log` file in the project root.

## Managing Task Dependencies

The `add-dependency` and `remove-dependency` commands allow you to manage task dependencies:

\`\`\`bash
# Add a dependency to a task
task-master add-dependency --id=<id> --depends-on=<id>

# Remove a dependency from a task
task-master remove-dependency --id=<id> --depends-on=<id>
\`\`\`

These commands:

1. **Allow precise dependency management**:
   - Add dependencies between tasks with automatic validation
   - Remove dependencies when they're no longer needed
   - Update task files automatically after changes

2. **Include validation checks**:
   - Prevent circular dependencies (a task depending on itself)
   - Prevent duplicate dependencies
   - Verify that both tasks exist before adding/removing dependencies
   - Check if dependencies exist before attempting to remove them

3. **Provide clear feedback**:
   - Success messages confirm when dependencies are added/removed
   - Error messages explain why operations failed (if applicable)

4. **Automatically update task files**:
   - Regenerates task files to reflect dependency changes
   - Ensures tasks and their files stay synchronized

## Dependency Validation and Fixing

The script provides two specialized commands to ensure task dependencies remain valid and properly maintained:

### Validating Dependencies

The `validate-dependencies` command allows you to check for invalid dependencies without making changes:

\`\`\`bash
# Check for invalid dependencies in tasks.json
task-master validate-dependencies

# Specify a different tasks file
task-master validate-dependencies --file=custom-tasks.json
\`\`\`

This command:
- Scans all tasks and subtasks for non-existent dependencies
- Identifies potential self-dependencies (tasks referencing themselves)
- Reports all found issues without modifying files
- Provides a comprehensive summary of dependency state
- Gives detailed statistics on task dependencies

Use this command to audit your task structure before applying fixes.

### Fixing Dependencies

The `fix-dependencies` command proactively finds and fixes all invalid dependencies:

\`\`\`bash
# Find and fix all invalid dependencies
task-master fix-dependencies

# Specify a different tasks file
task-master fix-dependencies --file=custom-tasks.json
\`\`\`

This command:
1. **Validates all dependencies** across tasks and subtasks
2. **Automatically removes**:
   - References to non-existent tasks and subtasks
   - Self-dependencies (tasks depending on themselves)
3. **Fixes issues in both**:
   - The tasks.json data structure
   - Individual task files during regeneration
4. **Provides a detailed report**:
   - Types of issues fixed (non-existent vs. self-dependencies)
   - Number of tasks affected (tasks vs. subtasks)
   - Where fixes were applied (tasks.json vs. task files)
   - List of all individual fixes made

This is especially useful when tasks have been deleted or IDs have changed, potentially breaking dependency chains.

## Analyzing Task Complexity

The `analyze-complexity` command allows you to automatically assess task complexity and generate expansion recommendations:

\`\`\`bash
# Analyze all tasks and generate expansion recommendations
task-master analyze-complexity

# Specify a custom output file
task-master analyze-complexity --output=custom-report.json

# Override the model used for analysis
task-master analyze-complexity --model=claude-3-opus-20240229

# Set a custom complexity threshold (1-10)
task-master analyze-complexity --threshold=6

# Use Perplexity AI for research-backed complexity analysis
task-master analyze-complexity --research
\`\`\`

Notes:
- The command uses Claude to analyze each task's complexity (or Perplexity with --research flag)
- Tasks are scored on a scale of 1-10
- Each task receives a recommended number of subtasks based on DEFAULT_SUBTASKS configuration
- The default output path is `scripts/task-complexity-report.json`
- Each task in the analysis includes a ready-to-use `expansionCommand` that can be copied directly to the terminal or executed programmatically
- Tasks with complexity scores below the threshold (default: 5) may not need expansion
- The research flag provides more contextual and informed complexity assessments

### Integration with Expand Command

The `expand` command automatically checks for and uses complexity analysis if available:

\`\`\`bash
# Expand a task, using complexity report recommendations if available
task-master expand --id=8

# Expand all tasks, prioritizing by complexity score if a report exists
task-master expand --all

# Override recommendations with explicit values
task-master expand --id=8 --num=5 --prompt="Custom prompt"
\`\`\`

When a complexity report exists:
- The `expand` command will use the recommended subtask count from the report (unless overridden)
- It will use the tailored expansion prompt from the report (unless a custom prompt is provided)
- When using `--all`, tasks are sorted by complexity score (highest first)
- The `--research` flag is preserved from the complexity analysis to expansion

The output report structure is:
\`\`\`json
{
  "meta": {
    "generatedAt": "2023-06-15T12:34:56.789Z",
    "tasksAnalyzed": 20,
    "thresholdScore": 5,
    "projectName": "Your Project Name",
    "usedResearch": true
  },
  "complexityAnalysis": [
    {
      "taskId": 8,
      "taskTitle": "Develop Implementation Drift Handling",
      "complexityScore": 9.5,
      "recommendedSubtasks": 6,
      "expansionPrompt": "Create subtasks that handle detecting...",
      "reasoning": "This task requires sophisticated logic...",
      "expansionCommand": "task-master expand --id=8 --num=6 --prompt=\"Create subtasks...\" --research"
    },
    // More tasks sorted by complexity score (highest first)
  ]
}
\`\`\`

## Finding the Next Task

The `next` command helps you determine which task to work on next based on dependencies and status:

\`\`\`bash
# Show the next task to work on
task-master next

# Specify a different tasks file
task-master next --file=custom-tasks.json
\`\`\`

This command:

1. Identifies all **eligible tasks** - pending or in-progress tasks whose dependencies are all satisfied (marked as done)
2. **Prioritizes** these eligible tasks by:
   - Priority level (high > medium > low)
   - Number of dependencies (fewer dependencies first)
   - Task ID (lower ID first)
3. **Displays** comprehensive information about the selected task:
   - Basic task details (ID, title, priority, dependencies)
   - Detailed description and implementation details
   - Subtasks if they exist
4. Provides **contextual suggested actions**:
   - Command to mark the task as in-progress
   - Command to mark the task as done when completed
   - Commands for working with subtasks (update status or expand)

This feature ensures you're always working on the most appropriate task based on your project's current state and dependency structure.

## Showing Task Details

The `show` command allows you to view detailed information about a specific task:

\`\`\`bash
# Show details for a specific task
task-master show 1

# Alternative syntax with --id option
task-master show --id=1

# Show details for a subtask
task-master show --id=1.2

# Specify a different tasks file
task-master show 3 --file=custom-tasks.json
\`\`\`

This command:

1. **Displays comprehensive information** about the specified task:
   - Basic task details (ID, title, priority, dependencies, status)
   - Full description and implementation details
   - Test strategy information
   - Subtasks if they exist
2. **Handles both regular tasks and subtasks**:
   - For regular tasks, shows all subtasks and their status
   - For subtasks, shows the parent task relationship
3. **Provides contextual suggested actions**:
   - Commands to update the task status
   - Commands for working with subtasks
   - For subtasks, provides a link to view the parent task

This command is particularly useful when you need to examine a specific task in detail before implementing it or when you want to check the status and details of a particular task.
```

# scripts/README.md

```md
# Meta-Development Script

This folder contains a **meta-development script** (`dev.js`) and related utilities that manage tasks for an AI-driven or traditional software development workflow. The script revolves around a `tasks.json` file, which holds an up-to-date list of development tasks.

## Overview

In an AI-driven development process—particularly with tools like [Cursor](https://www.cursor.so/)—it's beneficial to have a **single source of truth** for tasks. This script allows you to:

1. **Parse** a PRD or requirements document (`.txt`) to initialize a set of tasks (`tasks.json`).
2. **List** all existing tasks (IDs, statuses, titles).
3. **Update** tasks to accommodate new prompts or architecture changes (useful if you discover "implementation drift").
4. **Generate** individual task files (e.g., `task_001.txt`) for easy reference or to feed into an AI coding workflow.
5. **Set task status**—mark tasks as `done`, `pending`, or `deferred` based on progress.
6. **Expand** tasks with subtasks—break down complex tasks into smaller, more manageable subtasks.
7. **Research-backed subtask generation**—use Perplexity AI to generate more informed and contextually relevant subtasks.
8. **Clear subtasks**—remove subtasks from specified tasks to allow regeneration or restructuring.
9. **Show task details**—display detailed information about a specific task and its subtasks.

## Configuration

The script can be configured through environment variables in a `.env` file at the root of the project:

### Required Configuration
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

### Optional Configuration
- `MODEL`: Specify which Claude model to use (default: "claude-3-7-sonnet-20250219")
- `MAX_TOKENS`: Maximum tokens for model responses (default: 4000)
- `TEMPERATURE`: Temperature for model responses (default: 0.7)
- `PERPLEXITY_API_KEY`: Your Perplexity API key for research-backed subtask generation
- `PERPLEXITY_MODEL`: Specify which Perplexity model to use (default: "sonar-medium-online")
- `DEBUG`: Enable debug logging (default: false)
- `LOG_LEVEL`: Log level - debug, info, warn, error (default: info)
- `DEFAULT_SUBTASKS`: Default number of subtasks when expanding (default: 3)
- `DEFAULT_PRIORITY`: Default priority for generated tasks (default: medium)
- `PROJECT_NAME`: Override default project name in tasks.json
- `PROJECT_VERSION`: Override default version in tasks.json

## How It Works

1. **`tasks.json`**:  
   - A JSON file at the project root containing an array of tasks (each with `id`, `title`, `description`, `status`, etc.).  
   - The `meta` field can store additional info like the project's name, version, or reference to the PRD.  
   - Tasks can have `subtasks` for more detailed implementation steps.
   - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending) to easily track progress.

2. **CLI Commands**  
   You can run the commands via:

   \`\`\`bash
   # If installed globally
   task-master [command] [options]
   
   # If using locally within the project
   node scripts/dev.js [command] [options]
   \`\`\`

   Available commands:

   - `init`: Initialize a new project
   - `parse-prd`: Generate tasks from a PRD document
   - `list`: Display all tasks with their status
   - `update`: Update tasks based on new information
   - `generate`: Create individual task files
   - `set-status`: Change a task's status
   - `expand`: Add subtasks to a task or all tasks
   - `clear-subtasks`: Remove subtasks from specified tasks
   - `next`: Determine the next task to work on based on dependencies
   - `show`: Display detailed information about a specific task
   - `analyze-complexity`: Analyze task complexity and generate recommendations
   - `complexity-report`: Display the complexity analysis in a readable format
   - `add-dependency`: Add a dependency between tasks
   - `remove-dependency`: Remove a dependency from a task
   - `validate-dependencies`: Check for invalid dependencies
   - `fix-dependencies`: Fix invalid dependencies automatically
   - `add-task`: Add a new task using AI

   Run `task-master --help` or `node scripts/dev.js --help` to see detailed usage information.

## Listing Tasks

The `list` command allows you to view all tasks and their status:

\`\`\`bash
# List all tasks
task-master list

# List tasks with a specific status
task-master list --status=pending

# List tasks and include their subtasks
task-master list --with-subtasks

# List tasks with a specific status and include their subtasks
task-master list --status=pending --with-subtasks
\`\`\`

## Updating Tasks

The `update` command allows you to update tasks based on new information or implementation changes:

\`\`\`bash
# Update tasks starting from ID 4 with a new prompt
task-master update --from=4 --prompt="Refactor tasks from ID 4 onward to use Express instead of Fastify"

# Update all tasks (default from=1)
task-master update --prompt="Add authentication to all relevant tasks"

# Specify a different tasks file
task-master update --file=custom-tasks.json --from=5 --prompt="Change database from MongoDB to PostgreSQL"
\`\`\`

Notes:
- The `--prompt` parameter is required and should explain the changes or new context
- Only tasks that aren't marked as 'done' will be updated
- Tasks with ID >= the specified --from value will be updated

## Setting Task Status

The `set-status` command allows you to change a task's status:

\`\`\`bash
# Mark a task as done
task-master set-status --id=3 --status=done

# Mark a task as pending
task-master set-status --id=4 --status=pending

# Mark a specific subtask as done
task-master set-status --id=3.1 --status=done

# Mark multiple tasks at once
task-master set-status --id=1,2,3 --status=done
\`\`\`

Notes:
- When marking a parent task as "done", all of its subtasks will automatically be marked as "done" as well
- Common status values are 'done', 'pending', and 'deferred', but any string is accepted
- You can specify multiple task IDs by separating them with commas
- Subtask IDs are specified using the format `parentId.subtaskId` (e.g., `3.1`)
- Dependencies are updated to show completion status (✅ for completed, ⏱️ for pending) throughout the system

## Expanding Tasks

The `expand` command allows you to break down tasks into subtasks for more detailed implementation:

\`\`\`bash
# Expand a specific task with 3 subtasks (default)
task-master expand --id=3

# Expand a specific task with 5 subtasks
task-master expand --id=3 --num=5

# Expand a task with additional context
task-master expand --id=3 --prompt="Focus on security aspects"

# Expand all pending tasks that don't have subtasks
task-master expand --all

# Force regeneration of subtasks for all pending tasks
task-master expand --all --force

# Use Perplexity AI for research-backed subtask generation
task-master expand --id=3 --research

# Use Perplexity AI for research-backed generation on all pending tasks
task-master expand --all --research
\`\`\`

## Clearing Subtasks

The `clear-subtasks` command allows you to remove subtasks from specified tasks:

\`\`\`bash
# Clear subtasks from a specific task
task-master clear-subtasks --id=3

# Clear subtasks from multiple tasks
task-master clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
task-master clear-subtasks --all
\`\`\`

Notes:
- After clearing subtasks, task files are automatically regenerated
- This is useful when you want to regenerate subtasks with a different approach
- Can be combined with the `expand` command to immediately generate new subtasks
- Works with both parent tasks and individual subtasks

## AI Integration

The script integrates with two AI services:

1. **Anthropic Claude**: Used for parsing PRDs, generating tasks, and creating subtasks.
2. **Perplexity AI**: Used for research-backed subtask generation when the `--research` flag is specified.

The Perplexity integration uses the OpenAI client to connect to Perplexity's API, which provides enhanced research capabilities for generating more informed subtasks. If the Perplexity API is unavailable or encounters an error, the script will automatically fall back to using Anthropic's Claude.

To use the Perplexity integration:
1. Obtain a Perplexity API key
2. Add `PERPLEXITY_API_KEY` to your `.env` file
3. Optionally specify `PERPLEXITY_MODEL` in your `.env` file (default: "sonar-medium-online")
4. Use the `--research` flag with the `expand` command

## Logging

The script supports different logging levels controlled by the `LOG_LEVEL` environment variable:
- `debug`: Detailed information, typically useful for troubleshooting
- `info`: Confirmation that things are working as expected (default)
- `warn`: Warning messages that don't prevent execution
- `error`: Error messages that might prevent execution

When `DEBUG=true` is set, debug logs are also written to a `dev-debug.log` file in the project root.

## Managing Task Dependencies

The `add-dependency` and `remove-dependency` commands allow you to manage task dependencies:

\`\`\`bash
# Add a dependency to a task
task-master add-dependency --id=<id> --depends-on=<id>

# Remove a dependency from a task
task-master remove-dependency --id=<id> --depends-on=<id>
\`\`\`

These commands:

1. **Allow precise dependency management**:
   - Add dependencies between tasks with automatic validation
   - Remove dependencies when they're no longer needed
   - Update task files automatically after changes

2. **Include validation checks**:
   - Prevent circular dependencies (a task depending on itself)
   - Prevent duplicate dependencies
   - Verify that both tasks exist before adding/removing dependencies
   - Check if dependencies exist before attempting to remove them

3. **Provide clear feedback**:
   - Success messages confirm when dependencies are added/removed
   - Error messages explain why operations failed (if applicable)

4. **Automatically update task files**:
   - Regenerates task files to reflect dependency changes
   - Ensures tasks and their files stay synchronized

## Dependency Validation and Fixing

The script provides two specialized commands to ensure task dependencies remain valid and properly maintained:

### Validating Dependencies

The `validate-dependencies` command allows you to check for invalid dependencies without making changes:

\`\`\`bash
# Check for invalid dependencies in tasks.json
task-master validate-dependencies

# Specify a different tasks file
task-master validate-dependencies --file=custom-tasks.json
\`\`\`

This command:
- Scans all tasks and subtasks for non-existent dependencies
- Identifies potential self-dependencies (tasks referencing themselves)
- Reports all found issues without modifying files
- Provides a comprehensive summary of dependency state
- Gives detailed statistics on task dependencies

Use this command to audit your task structure before applying fixes.

### Fixing Dependencies

The `fix-dependencies` command proactively finds and fixes all invalid dependencies:

\`\`\`bash
# Find and fix all invalid dependencies
task-master fix-dependencies

# Specify a different tasks file
task-master fix-dependencies --file=custom-tasks.json
\`\`\`

This command:
1. **Validates all dependencies** across tasks and subtasks
2. **Automatically removes**:
   - References to non-existent tasks and subtasks
   - Self-dependencies (tasks depending on themselves)
3. **Fixes issues in both**:
   - The tasks.json data structure
   - Individual task files during regeneration
4. **Provides a detailed report**:
   - Types of issues fixed (non-existent vs. self-dependencies)
   - Number of tasks affected (tasks vs. subtasks)
   - Where fixes were applied (tasks.json vs. task files)
   - List of all individual fixes made

This is especially useful when tasks have been deleted or IDs have changed, potentially breaking dependency chains.

## Analyzing Task Complexity

The `analyze-complexity` command allows you to automatically assess task complexity and generate expansion recommendations:

\`\`\`bash
# Analyze all tasks and generate expansion recommendations
task-master analyze-complexity

# Specify a custom output file
task-master analyze-complexity --output=custom-report.json

# Override the model used for analysis
task-master analyze-complexity --model=claude-3-opus-20240229

# Set a custom complexity threshold (1-10)
task-master analyze-complexity --threshold=6

# Use Perplexity AI for research-backed complexity analysis
task-master analyze-complexity --research
\`\`\`

Notes:
- The command uses Claude to analyze each task's complexity (or Perplexity with --research flag)
- Tasks are scored on a scale of 1-10
- Each task receives a recommended number of subtasks based on DEFAULT_SUBTASKS configuration
- The default output path is `scripts/task-complexity-report.json`
- Each task in the analysis includes a ready-to-use `expansionCommand` that can be copied directly to the terminal or executed programmatically
- Tasks with complexity scores below the threshold (default: 5) may not need expansion
- The research flag provides more contextual and informed complexity assessments

### Integration with Expand Command

The `expand` command automatically checks for and uses complexity analysis if available:

\`\`\`bash
# Expand a task, using complexity report recommendations if available
task-master expand --id=8

# Expand all tasks, prioritizing by complexity score if a report exists
task-master expand --all

# Override recommendations with explicit values
task-master expand --id=8 --num=5 --prompt="Custom prompt"
\`\`\`

When a complexity report exists:
- The `expand` command will use the recommended subtask count from the report (unless overridden)
- It will use the tailored expansion prompt from the report (unless a custom prompt is provided)
- When using `--all`, tasks are sorted by complexity score (highest first)
- The `--research` flag is preserved from the complexity analysis to expansion

The output report structure is:
\`\`\`json
{
  "meta": {
    "generatedAt": "2023-06-15T12:34:56.789Z",
    "tasksAnalyzed": 20,
    "thresholdScore": 5,
    "projectName": "Your Project Name",
    "usedResearch": true
  },
  "complexityAnalysis": [
    {
      "taskId": 8,
      "taskTitle": "Develop Implementation Drift Handling",
      "complexityScore": 9.5,
      "recommendedSubtasks": 6,
      "expansionPrompt": "Create subtasks that handle detecting...",
      "reasoning": "This task requires sophisticated logic...",
      "expansionCommand": "task-master expand --id=8 --num=6 --prompt=\"Create subtasks...\" --research"
    },
    // More tasks sorted by complexity score (highest first)
  ]
}
\`\`\`

## Finding the Next Task

The `next` command helps you determine which task to work on next based on dependencies and status:

\`\`\`bash
# Show the next task to work on
task-master next

# Specify a different tasks file
task-master next --file=custom-tasks.json
\`\`\`

This command:

1. Identifies all **eligible tasks** - pending or in-progress tasks whose dependencies are all satisfied (marked as done)
2. **Prioritizes** these eligible tasks by:
   - Priority level (high > medium > low)
   - Number of dependencies (fewer dependencies first)
   - Task ID (lower ID first)
3. **Displays** comprehensive information about the selected task:
   - Basic task details (ID, title, priority, dependencies)
   - Detailed description and implementation details
   - Subtasks if they exist
4. Provides **contextual suggested actions**:
   - Command to mark the task as in-progress
   - Command to mark the task as done when completed
   - Commands for working with subtasks (update status or expand)

This feature ensures you're always working on the most appropriate task based on your project's current state and dependency structure.

## Showing Task Details

The `show` command allows you to view detailed information about a specific task:

\`\`\`bash
# Show details for a specific task
task-master show 1

# Alternative syntax with --id option
task-master show --id=1

# Show details for a subtask
task-master show --id=1.2

# Specify a different tasks file
task-master show 3 --file=custom-tasks.json
\`\`\`

This command:

1. **Displays comprehensive information** about the specified task:
   - Basic task details (ID, title, priority, dependencies, status)
   - Full description and implementation details
   - Test strategy information
   - Subtasks if they exist
2. **Handles both regular tasks and subtasks**:
   - For regular tasks, shows all subtasks and their status
   - For subtasks, shows the parent task relationship
3. **Provides contextual suggested actions**:
   - Commands to update the task status
   - Commands for working with subtasks
   - For subtasks, provides a link to view the parent task

This command is particularly useful when you need to examine a specific task in detail before implementing it or when you want to check the status and details of a particular task.
```

# sql/rls_policies.sql

```sql
-- Enable RLS on the media_items table
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Create a user_id column to track ownership
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Policy for viewing media items (all authenticated users can view)
CREATE POLICY "Users can view all media items"
ON media_items
FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting media items (authenticated users can insert their own)
CREATE POLICY "Users can insert their own media items"
ON media_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for updating media items (users can only update their own)
CREATE POLICY "Users can update their own media items"
ON media_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting media items (users can only delete their own)
CREATE POLICY "Users can delete their own media items"
ON media_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket policies
-- Images bucket
CREATE POLICY "Users can view all images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'images');

CREATE POLICY "Users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'images');

-- Videos bucket
CREATE POLICY "Users can view all videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'videos');

-- Audio bucket
CREATE POLICY "Users can view all audio"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio');

CREATE POLICY "Users can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own audio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Users can delete their own audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'audio');

-- Documents bucket
CREATE POLICY "Users can view all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'documents');

```

# store/blocks-store.ts

```ts
import { create } from "zustand";
import type { BlockType, DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import {
  findDropAreaById,
  updateDropAreaById,
  isDropAreaEmpty,
  findBlockById,
  canMergeAreas,
  findParentOfSplitAreas,
} from "@/lib/utils/drop-area-utils";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import type { ProjectData } from "@/lib/types";

// Types for the store
interface DragItem {
  id?: string;
  type: string;
  content: string;
  sourceDropAreaId?: string;
}

interface BlocksState {
  // State
  dropAreas: DropAreaType[];
  selectedBlockId: string | null;
  previewMode: boolean;
  currentProjectId: string | null;
  currentProjectTitle: string;
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  projectJustDeleted: boolean;
  deletedProjectTitle: string | null;

  // Block Actions
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => void;
  addBlockAtIndex: (
    block: Omit<BlockType, "id">,
    dropAreaId: string,
    index: number
  ) => void; // New action
  moveBlock: (
    blockId: string,
    sourceAreaId: string,
    targetAreaId: string
  ) => void;
  deleteBlock: (blockId: string, dropAreaId: string) => void;
  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
  selectBlock: (id: string | null) => void;
  reorderBlocks: (dropAreaId: string, blocks: BlockType[]) => void;

  // Drop Area Actions
  splitDropArea: (dropAreaId: string) => void;
  splitPopulatedDropArea: (dropAreaId: string) => void;
  mergeDropAreas: (firstAreaId: string, secondAreaId: string) => void;
  deleteDropArea: (dropAreaId: string) => void;
  insertDropAreaBetween: (beforeAreaId: string, afterAreaId: string) => string;
  insertDropArea: (insertIndex: number) => string;
  insertBlockInNewArea: (item: DragItem, insertIndex: number) => void;

  // Area State Checks
  canMerge: (firstAreaId: string, secondAreaId: string) => boolean;
  canSplit: (dropAreaId: string, viewport: ViewportType) => boolean;
  cleanupEmptyDropAreas: () => void;

  // Project Actions
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectTitle: string, description?: string) => Promise<boolean>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;

  // UI State Actions
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  toggleAutoSave: (enabled: boolean) => void;
  triggerAutoSave: () => void;
  setProjectJustDeleted: (deleted: boolean) => void;
  setDeletedProjectTitle: (title: string | null) => void;
}

// Debounce helper function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Create the store
export const useBlocksStore = create<BlocksState>((set, get) => {
  // Create a debounced version of the save function
  const debouncedSave = debounce(async () => {
    const { currentProjectTitle, currentProjectId, isSaving, autoSaveEnabled } =
      get();

    if (isSaving || !currentProjectId || !autoSaveEnabled) {
      return;
    }

    set({ isSaving: true });

    try {
      const success = await get().saveProject(currentProjectTitle);
      set({
        lastSaved: success ? new Date() : null,
        isSaving: false,
      });
    } catch (error: any) {
      set({ isSaving: false });
      throw new Error(`Auto-save error: ${error.message}`);
    }
  }, 2000);

  return {
    // Initial state
    dropAreas: [
      {
        id: "drop-area-1",
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      },
    ],
    selectedBlockId: null,
    previewMode: false,
    currentProjectId: null,
    currentProjectTitle: "Untitled Project",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    projectJustDeleted: false,
    deletedProjectTitle: null,

    // Block Actions
    addBlock: (block, dropAreaId) => {
      const id = `block-${Date.now()}`;
      const newBlock: BlockType = {
        ...block,
        id,
        dropAreaId,
        ...(block.type === "heading" && {
          headingLevel: block.headingLevel || 1,
        }),
      };

      set((state) => {
        const targetArea = findDropAreaById(state.dropAreas, dropAreaId);
        if (!targetArea) {
          throw new Error(`Drop area ${dropAreaId} not found`);
        }

        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            // Create a deep copy of the area before modifying to ensure isolation
            const areaCopy = JSON.parse(JSON.stringify(area));
            // Modify the copy
            areaCopy.blocks.push(newBlock);
            return areaCopy; // Return the modified deep copy
          }
        );

        // Add new empty area if needed
        const lastRootArea = updated[updated.length - 1];
        const lastAreaHasBlocks =
          lastRootArea.blocks.length > 0 ||
          (lastRootArea.isSplit &&
            lastRootArea.splitAreas.some((a) => a.blocks.length > 0));

        if (lastAreaHasBlocks) {
          return {
            ...state,
            dropAreas: [
              ...updated,
              {
                id: `drop-area-${updated.length + 1}`,
                blocks: [],
                isSplit: false,
                splitAreas: [],
                splitLevel: 0,
              },
            ],
          };
        }

        return { ...state, dropAreas: updated };
      });

      // Cleanup and auto-save
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    moveBlock: (blockId, sourceAreaId, targetAreaId) => {
      set((state) => {
        try {
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(state.dropAreas, blockId);
          if (!foundBlock) {
            throw new Error(`Block ${blockId} not found`);
          }

          const sourceAreaToUse = actualSourceAreaId || sourceAreaId;
          if (sourceAreaToUse === targetAreaId) {
            return state;
          }

          let rootAreas = JSON.parse(JSON.stringify(state.dropAreas));
          const targetIndex = rootAreas.findIndex(
            (area: DropAreaType) => area.id === targetAreaId
          );

          // Handle dropping between populated areas
          const prevArea = targetIndex > 0 ? rootAreas[targetIndex - 1] : null;
          const nextArea =
            targetIndex < rootAreas.length - 1
              ? rootAreas[targetIndex + 1]
              : null;

          const isPrevPopulated =
            prevArea &&
            (!isDropAreaEmpty(prevArea) ||
              (prevArea.isSplit &&
                prevArea.splitAreas.some(
                  (a: DropAreaType) => !isDropAreaEmpty(a)
                )));
          const isNextPopulated =
            nextArea &&
            (!isDropAreaEmpty(nextArea) ||
              (nextArea.isSplit &&
                nextArea.splitAreas.some(
                  (a: DropAreaType) => !isDropAreaEmpty(a)
                )));

          let finalTargetAreaId = targetAreaId;

          // Create new area between populated areas if needed
          if (isPrevPopulated && isNextPopulated) {
            const newArea: DropAreaType = {
              id: `drop-area-${Date.now()}`,
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            };
            rootAreas.splice(targetIndex, 0, newArea);
            finalTargetAreaId = newArea.id;
          }

          // Remove block from source
          rootAreas = updateDropAreaById(
            rootAreas,
            sourceAreaToUse,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((block) => block.id !== blockId),
            })
          );

          // Add block to target (either new area or original target)
          const blockToMove = { ...foundBlock, dropAreaId: finalTargetAreaId };
          rootAreas = updateDropAreaById(
            rootAreas,
            finalTargetAreaId,
            (area) => ({
              ...area,
              blocks: [...area.blocks, blockToMove],
            })
          );

          return { ...state, dropAreas: rootAreas };
        } catch (error: any) {
          throw new Error(`Error moving block: ${error.message}`);
        }
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    deleteBlock: (blockId, dropAreaId) => {
      set((state) => {
        const { block: foundBlock, dropAreaId: actualDropAreaId } =
          findBlockById(state.dropAreas, blockId);
        if (!foundBlock) {
          throw new Error(`Block ${blockId} not found`);
        }

        const dropAreaToUse = actualDropAreaId || dropAreaId;
        let updated = updateDropAreaById(
          state.dropAreas,
          dropAreaToUse,
          (area) => ({
            ...area,
            blocks: area.blocks.filter((block) => block.id !== blockId),
          })
        );

        // Check if we need to add an empty area at the end
        const lastArea = updated[updated.length - 1];
        const lastAreaHasContent =
          lastArea.blocks.length > 0 ||
          (lastArea.isSplit &&
            lastArea.splitAreas.some((a) => a.blocks.length > 0));

        if (lastAreaHasContent) {
          updated = [
            ...updated,
            {
              id: `drop-area-${Date.now()}`,
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ];
        }

        return { ...state, dropAreas: updated };
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    updateBlockContent: (
      blockId,
      dropAreaId,
      content,
      additionalProps = {}
    ) => {
      set((state) => {
        const { block: foundBlock, dropAreaId: actualDropAreaId } =
          findBlockById(state.dropAreas, blockId);
        if (!foundBlock) {
          throw new Error(`Block ${blockId} not found`);
        }

        const dropAreaToUse = actualDropAreaId || dropAreaId;
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaToUse,
          (area) => ({
            ...area,
            blocks: area.blocks.map((block) =>
              block.id === blockId
                ? { ...block, content, ...additionalProps }
                : block
            ),
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    selectBlock: (id) => set({ selectedBlockId: id }),

    reorderBlocks: (dropAreaId, blocks) => {
      set((state) => {
        const blocksCopy = blocks.map((block) => ({ ...block }));
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => ({
            ...area,
            blocks: blocksCopy,
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    addBlockAtIndex: (block, dropAreaId, index) => {
      const id = `block-${Date.now()}`;
      const newBlock: BlockType = {
        ...block,
        id,
        dropAreaId, // Ensure dropAreaId is set on the block itself
        ...(block.type === "heading" && {
          headingLevel: block.headingLevel || 1,
        }),
      };

      set((state) => {
        // --- Simplified State Update ---
        const dropAreasCopy = JSON.parse(JSON.stringify(state.dropAreas));
        const targetArea = findDropAreaById(dropAreasCopy, dropAreaId);

        if (!targetArea) {
          throw new Error(
            `[addBlockAtIndex] Target drop area ${dropAreaId} not found.`
          );
        }

        // Insert block at the specified index directly into the found area's blocks
        targetArea.blocks.splice(index, 0, newBlock);

        // Note: Unlike addBlock, we don't automatically add a new empty area here.
        // Insertion should happen within the target area.
        return { ...state, dropAreas: dropAreasCopy };
        // --- End Simplified State Update ---
      });

      // Cleanup and auto-save
      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    // Drop Area Actions
    splitDropArea: (dropAreaId) => {
      set((state) => {
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            const leftAreaId = `${area.id}-left-${Date.now()}`;
            const rightAreaId = `${area.id}-right-${Date.now()}`;

            return {
              ...area,
              isSplit: true,
              splitAreas: [
                {
                  id: leftAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
                {
                  id: rightAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
              ],
            };
          }
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    splitPopulatedDropArea: (dropAreaId) => {
      set((state) => {
        const updated = updateDropAreaById(
          state.dropAreas,
          dropAreaId,
          (area) => {
            const leftAreaId = `${area.id}-left-${Date.now()}`;
            const rightAreaId = `${area.id}-right-${Date.now()}`;

            return {
              ...area,
              isSplit: true,
              blocks: [],
              splitAreas: [
                {
                  id: leftAreaId,
                  blocks: area.blocks.map((block) => ({
                    ...block,
                    dropAreaId: leftAreaId,
                  })),
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
                {
                  id: rightAreaId,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: area.splitLevel + 1,
                  parentId: area.id,
                },
              ],
            };
          }
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    mergeDropAreas: (firstAreaId, secondAreaId) => {
      set((state) => {
        const parent = findParentOfSplitAreas(
          state.dropAreas,
          firstAreaId,
          secondAreaId
        );
        if (!parent) return state;

        const firstArea = findDropAreaById(state.dropAreas, firstAreaId);
        const secondArea = findDropAreaById(state.dropAreas, secondAreaId);
        if (!firstArea || !secondArea) return state;

        const firstAreaEmpty = firstArea.blocks.length === 0;
        const blocksForMergedArea = firstAreaEmpty
          ? secondArea.blocks
          : firstArea.blocks;

        const updated = updateDropAreaById(
          state.dropAreas,
          parent.id,
          (area) => ({
            ...area,
            isSplit: false,
            splitAreas: [],
            splitLevel: Math.max(0, area.splitLevel - 1),
            blocks: blocksForMergedArea.map((block) => ({
              ...block,
              dropAreaId: area.id,
            })),
          })
        );

        return { ...state, dropAreas: updated };
      });

      get().triggerAutoSave();
    },

    deleteDropArea: (dropAreaId) => {
      set((state) => {
        if (state.dropAreas.length <= 1) {
          throw new Error("Cannot delete the only drop area");
        }

        const updated = state.dropAreas.filter(
          (area) => area.id !== dropAreaId
        );
        return { ...state, dropAreas: updated };
      });

      setTimeout(() => {
        set((state) => {
          if (state.dropAreas.length === 0) {
            return {
              ...state,
              dropAreas: [
                {
                  id: `drop-area-${Date.now()}`,
                  blocks: [],
                  isSplit: false,
                  splitAreas: [],
                  splitLevel: 0,
                },
              ],
            };
          }
          return state;
        });
        get().triggerAutoSave();
      }, 0);
    },

    // Area State Checks
    canMerge: (firstAreaId, secondAreaId) => {
      const { dropAreas } = get();
      return canMergeAreas(dropAreas, firstAreaId, secondAreaId);
    },

    canSplit: (dropAreaId, viewport) => {
      const { dropAreas } = get();
      const area = findDropAreaById(dropAreas, dropAreaId);
      if (!area) return false;

      if (viewport === "mobile") return false;
      if (viewport === "tablet" && area.splitLevel >= 1) return false;
      if (viewport === "desktop" && area.splitLevel >= 2) return false;

      return true;
    },

    cleanupEmptyDropAreas: () => {
      set((state) => {
        const rootAreas = [...state.dropAreas];
        if (rootAreas.length <= 1) return state;

        const hasPopulatedAreas = rootAreas.some(
          (area) =>
            !isDropAreaEmpty(area) ||
            (area.isSplit && area.splitAreas.some((a) => !isDropAreaEmpty(a)))
        );

        if (hasPopulatedAreas) {
          rootAreas.sort((a, b) => {
            const aEmpty =
              isDropAreaEmpty(a) &&
              (!a.isSplit || a.splitAreas.every(isDropAreaEmpty));
            const bEmpty =
              isDropAreaEmpty(b) &&
              (!b.isSplit || b.splitAreas.every(isDropAreaEmpty));
            return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
          });
        }

        // Remove consecutive empty areas
        for (let i = 0; i < rootAreas.length - 1; i++) {
          if (
            isDropAreaEmpty(rootAreas[i]) &&
            isDropAreaEmpty(rootAreas[i + 1])
          ) {
            rootAreas.splice(i + 1, 1);
            i--;
          }
        }

        // Ensure one empty area at the end if needed
        const lastArea = rootAreas[rootAreas.length - 1];
        if (!isDropAreaEmpty(lastArea)) {
          rootAreas.push({
            id: `drop-area-${Date.now()}`,
            blocks: [],
            isSplit: false,
            splitAreas: [],
            splitLevel: 0,
          });
        }

        return { ...state, dropAreas: rootAreas };
      });
    },

    // Project Actions
    loadProject: async (projectId) => {
      try {
        const projectData = await loadProjectFromStorage(projectId);
        if (!projectData) {
          throw new Error(`Project ${projectId} not found`);
        }

        const dropAreasCopy = JSON.parse(JSON.stringify(projectData.dropAreas));
        set({
          dropAreas: dropAreasCopy,
          currentProjectId: projectData.id,
          currentProjectTitle: projectData.title,
          isLoading: false,
          lastSaved: new Date(projectData.updatedAt),
        });

        return true;
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(`Error loading project ${projectId}: ${error.message}`);
      }
    },

    saveProject: async (projectTitle, description) => {
      const { dropAreas, currentProjectId } = get();
      if (!currentProjectId) {
        const newId = await get().createNewProject(projectTitle, description);
        return !!newId;
      }

      try {
        const existingProjectData = await loadProjectFromStorage(
          currentProjectId
        );
        const projectData: ProjectData = {
          id: currentProjectId,
          title: projectTitle,
          description,
          dropAreas,
          createdAt: existingProjectData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const success = await saveProjectToStorage(projectData);
        set({
          currentProjectTitle: projectTitle,
          isSaving: false,
          lastSaved: success ? new Date() : null,
        });

        return success;
      } catch (error: any) {
        set({ isSaving: false });
        throw new Error(
          `Error saving project ${currentProjectId}: ${error.message}`
        );
      }
    },

    createNewProject: async (title, description) => {
      const { currentProjectId, dropAreas } = get();
      const isEmptyProject = (areas: DropAreaType[]) => {
        return !areas.some(
          (area) =>
            area.blocks.length > 0 ||
            (area.isSplit && area.splitAreas.some((a) => a.blocks.length > 0))
        );
      };

      if (currentProjectId && isEmptyProject(dropAreas)) {
        set({
          currentProjectTitle: title || "Untitled Project",
          lastSaved: new Date(),
        });
        return currentProjectId;
      }

      try {
        const newProjectId = `project-${Date.now()}`;
        const projectData: ProjectData = {
          id: newProjectId,
          title: title || "Untitled Project",
          description,
          dropAreas: [
            {
              id: "drop-area-1",
              blocks: [],
              isSplit: false,
              splitAreas: [],
              splitLevel: 0,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const success = await saveProjectToStorage(projectData);
        if (!success) {
          set({ isSaving: false });
          return null;
        }

        set({
          dropAreas: projectData.dropAreas,
          currentProjectId: newProjectId,
          currentProjectTitle: projectData.title,
          isSaving: false,
          lastSaved: new Date(),
        });

        return newProjectId;
      } catch (error: any) {
        set({ isSaving: false });
        throw new Error("Error creating new project: " + error.message);
      }
    },

    setProjectTitle: (title) => {
      set({ currentProjectTitle: title });
      get().triggerAutoSave();
    },

    // UI State Actions
    setPreviewMode: (enabled) => set({ previewMode: enabled }),

    togglePreviewMode: () =>
      set((state) => ({ previewMode: !state.previewMode })),

    toggleAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),

    triggerAutoSave: () => {
      const { autoSaveEnabled, currentProjectId, isSaving } = get();
      if (isSaving || !autoSaveEnabled || !currentProjectId) {
        return;
      }
      debouncedSave();
    },

    // Area Insertion Actions
    insertDropAreaBetween: (beforeAreaId, afterAreaId) => {
      const newAreaId = `drop-area-${Date.now()}`;
      set((state) => {
        const rootAreas = [...state.dropAreas];
        const beforeIndex = rootAreas.findIndex(
          (area) => area.id === beforeAreaId
        );
        const afterIndex = rootAreas.findIndex(
          (area) => area.id === afterAreaId
        );

        if (beforeIndex === -1 || afterIndex === -1) {
          throw new Error("Could not find areas to insert between");
        }

        rootAreas.splice(afterIndex, 0, {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        });

        return { ...state, dropAreas: rootAreas };
      });

      return newAreaId;
    },

    insertDropArea: (insertIndex) => {
      const newAreaId = `drop-area-${Date.now()}`;
      set((state) => {
        const updatedAreas = [...state.dropAreas];
        updatedAreas.splice(insertIndex, 0, {
          id: newAreaId,
          blocks: [],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        });

        return { ...state, dropAreas: updatedAreas };
      });

      return newAreaId;
    },

    insertBlockInNewArea: (item, insertIndex) => {
      set((state) => {
        let updatedAreas = [...state.dropAreas];
        const newAreaId = `drop-area-${Date.now()}`;
        let blockToInsert: BlockType;

        if (item.id && item.sourceDropAreaId) {
          const { block: foundBlock, dropAreaId: actualSourceAreaId } =
            findBlockById(updatedAreas, item.id);
          if (!foundBlock) {
            throw new Error(`Block ${item.id} not found for insertion`);
          }

          updatedAreas = updateDropAreaById(
            updatedAreas,
            actualSourceAreaId || item.sourceDropAreaId,
            (area) => ({
              ...area,
              blocks: area.blocks.filter((b) => b.id !== item.id),
            })
          );

          blockToInsert = { ...foundBlock, dropAreaId: newAreaId };
        } else {
          blockToInsert = {
            id: `block-${Date.now()}`,
            type: item.type,
            content: item.content,
            dropAreaId: newAreaId,
            ...(item.type === "heading" && { headingLevel: 1 }),
          };
        }

        const newArea: DropAreaType = {
          id: newAreaId,
          blocks: [blockToInsert],
          isSplit: false,
          splitAreas: [],
          splitLevel: 0,
        };

        updatedAreas.splice(insertIndex, 0, newArea);
        return { ...state, dropAreas: updatedAreas };
      });

      setTimeout(() => {
        get().cleanupEmptyDropAreas();
        get().triggerAutoSave();
      }, 0);
    },

    // UI State Action Implementation
    setProjectJustDeleted: (deleted) => set({ projectJustDeleted: deleted }),
    setDeletedProjectTitle: (title) => set({ deletedProjectTitle: title }),
  };
});

```

# store/blocks/area-state-checks.ts

```ts
import type { BlocksState } from "./types";
import type { ViewportType } from "@/lib/hooks/use-viewport";
import {
  isDropAreaEmpty,
  canMergeAreas,
  findDropAreaById,
} from "@/lib/utils/drop-area-utils";
import { createEmptyDropArea } from "./utils";

export const createAreaStateChecks = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  canMerge: (firstAreaId: string, secondAreaId: string) => {
    const { dropAreas } = get();
    return canMergeAreas(dropAreas, firstAreaId, secondAreaId);
  },

  canSplit: (dropAreaId: string, viewport: ViewportType) => {
    const { dropAreas } = get();
    const area = findDropAreaById(dropAreas, dropAreaId);
    if (!area) return false;

    const maxSplitLevel: Record<ViewportType, number> = {
      mobile: 0, // No splitting on mobile
      tablet: 1, // Max 1 split (2 columns) on tablet
      desktop: 2, // Max 2 splits (4 columns) on desktop
    };

    return !area.isSplit && area.splitLevel < maxSplitLevel[viewport];
  },

  cleanupEmptyDropAreas: () => {
    set((state) => {
      const rootAreas = [...state.dropAreas];
      if (rootAreas.length <= 1) return state;

      const hasPopulatedAreas = rootAreas.some(
        (area) =>
          !isDropAreaEmpty(area) ||
          (area.isSplit && area.splitAreas.some((a) => !isDropAreaEmpty(a)))
      );

      if (hasPopulatedAreas) {
        rootAreas.sort((a, b) => {
          const aEmpty =
            isDropAreaEmpty(a) &&
            (!a.isSplit || a.splitAreas.every(isDropAreaEmpty));
          const bEmpty =
            isDropAreaEmpty(b) &&
            (!b.isSplit || b.splitAreas.every(isDropAreaEmpty));
          return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
        });
      }

      // Remove consecutive empty areas
      for (let i = 0; i < rootAreas.length - 1; i++) {
        if (
          isDropAreaEmpty(rootAreas[i]) &&
          isDropAreaEmpty(rootAreas[i + 1])
        ) {
          rootAreas.splice(i + 1, 1);
          i--;
        }
      }

      // Ensure one empty area at the end if needed
      const lastArea = rootAreas[rootAreas.length - 1];
      if (!isDropAreaEmpty(lastArea)) {
        rootAreas.push(createEmptyDropArea(`drop-area-${Date.now()}`));
      }

      return { ...state, dropAreas: rootAreas };
    });
  },
});

```

# store/blocks/block-actions.ts

```ts
import type { BlockType, DropAreaType } from "@/lib/types";
import type { BlocksState } from "./types";
import {
  findBlockById,
  updateDropAreaById,
  isDropAreaEmpty,
} from "@/lib/utils/drop-area-utils";
import { createEmptyDropArea, findDropAreaById } from "./utils";

export const createBlockActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newBlock: BlockType = {
      ...block,
      id: `block-${Date.now()}`,
      dropAreaId,
    };

    const newDropAreas = [...dropAreas];
    const targetAreaIndex = newDropAreas.findIndex(
      (area) => area.id === dropAreaId
    );
    if (targetAreaIndex === -1) return;

    newDropAreas[targetAreaIndex] = {
      ...newDropAreas[targetAreaIndex],
      blocks: [...newDropAreas[targetAreaIndex].blocks, newBlock],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  moveBlock: (blockId: string, sourceAreaId: string, targetAreaId: string) => {
    const { dropAreas } = get();
    const sourceArea = findDropAreaById(dropAreas, sourceAreaId);
    const targetArea = findDropAreaById(dropAreas, targetAreaId);
    if (!sourceArea || !targetArea) return;

    const blockToMove = sourceArea.blocks.find((block) => block.id === blockId);
    if (!blockToMove) return;

    const newDropAreas = [...dropAreas];
    const sourceAreaIndex = newDropAreas.findIndex(
      (area) => area.id === sourceAreaId
    );
    const targetAreaIndex = newDropAreas.findIndex(
      (area) => area.id === targetAreaId
    );
    if (sourceAreaIndex === -1 || targetAreaIndex === -1) return;

    // Remove block from source area
    newDropAreas[sourceAreaIndex] = {
      ...newDropAreas[sourceAreaIndex],
      blocks: newDropAreas[sourceAreaIndex].blocks.filter(
        (block) => block.id !== blockId
      ),
    };

    // Add block to target area
    const movedBlock: BlockType = {
      ...blockToMove,
      dropAreaId: targetAreaId,
    };

    newDropAreas[targetAreaIndex] = {
      ...newDropAreas[targetAreaIndex],
      blocks: [...newDropAreas[targetAreaIndex].blocks, movedBlock],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  deleteBlock: (blockId: string, dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newDropAreas = [...dropAreas];
    const areaIndex = newDropAreas.findIndex((area) => area.id === dropAreaId);
    if (areaIndex === -1) return;

    newDropAreas[areaIndex] = {
      ...newDropAreas[areaIndex],
      blocks: newDropAreas[areaIndex].blocks.filter(
        (block) => block.id !== blockId
      ),
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return;

    const newDropAreas = [...dropAreas];
    const areaIndex = newDropAreas.findIndex((area) => area.id === dropAreaId);
    if (areaIndex === -1) return;

    const blockIndex = newDropAreas[areaIndex].blocks.findIndex(
      (block) => block.id === blockId
    );
    if (blockIndex === -1) return;

    newDropAreas[areaIndex] = {
      ...newDropAreas[areaIndex],
      blocks: [
        ...newDropAreas[areaIndex].blocks.slice(0, blockIndex),
        {
          ...newDropAreas[areaIndex].blocks[blockIndex],
          content,
          ...additionalProps,
        },
        ...newDropAreas[areaIndex].blocks.slice(blockIndex + 1),
      ],
    };

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  selectBlock: (id: string | null) => set((state) => ({ ...state, selectedBlockId: id })),

  reorderBlocks: (dropAreaId: string, blocks: BlockType[]) => {
    set((state) => {
      const blocksCopy = blocks.map((block) => ({ ...block }));
      const updated = updateDropAreaById(
        state.dropAreas,
        dropAreaId,
        (area) => ({
          ...area,
          blocks: blocksCopy,
        })
      );

      return { ...state, dropAreas: updated };
    });

    get().triggerAutoSave();
  },
});

```

# store/blocks/drop-area-actions.ts

```ts
import type { ViewportType } from "@/lib/hooks/use-viewport"; // Moved import to top
import type { BlocksState } from "./types";
import type { DropAreaType } from "@/lib/types";
import { findDropAreaById, isDropAreaEmpty } from "./utils";

export const createDropAreaActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  splitDropArea: (dropAreaId: string) => {
    const { dropAreas } = get();
    const dropAreaIndex = dropAreas.findIndex(
      (area: DropAreaType) => area.id === dropAreaId
    );
    if (dropAreaIndex === -1) return;

    const newDropAreas = [...dropAreas];
    const targetArea = { ...newDropAreas[dropAreaIndex] };

    // Create two new split areas
    const splitArea1: DropAreaType = {
      id: `${dropAreaId}-split-1`,
      blocks: [],
      isSplit: false,
      splitAreas: [],
      splitLevel: targetArea.splitLevel + 1,
      parentId: targetArea.id, // Set parent ID
    };

    const splitArea2: DropAreaType = {
      id: `${dropAreaId}-split-2`,
      blocks: [],
      isSplit: false,
      splitAreas: [],
      splitLevel: targetArea.splitLevel + 1,
      parentId: targetArea.id, // Set parent ID
    };

    // Move existing blocks to the first split area
    splitArea1.blocks = [...targetArea.blocks];

    // Update the target area
    const updatedTargetArea: DropAreaType = {
      id: targetArea.id,
      blocks: [], // Blocks are moved to splitArea1
      isSplit: true,
      splitAreas: [splitArea1, splitArea2], // Assign actual objects
      splitLevel: targetArea.splitLevel,
    };

    // Update the target area in the array
    newDropAreas[dropAreaIndex] = updatedTargetArea;
    // Do NOT splice the split areas into the main array

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },

  mergeDropAreas: (dropAreaId: string, mergeTargetId: string = "") => {
    const { dropAreas } = get();

    // If mergeTargetId is provided, find the parent of both areas
    if (mergeTargetId) {
      // Find both areas
      const area1 = findDropAreaById(dropAreas, dropAreaId);
      const area2 = findDropAreaById(dropAreas, mergeTargetId);

      if (!area1 || !area2) return;

      // Find parent by checking if its splitAreas contain the IDs
      const parentArea = dropAreas.find(
        (area) =>
          area.isSplit &&
          area.splitAreas.some((sa) => sa.id === area1.id) &&
          area.splitAreas.some((sa) => sa.id === area2.id)
      );

      if (parentArea) {
        // Use the parent area ID for the merge operation
        dropAreaId = parentArea.id;
      }
    }

    // Continue with the original logic
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea || !dropArea.isSplit) return;

    // Get the actual split area objects directly
    const splitAreas = dropArea.splitAreas;

    // Merge blocks from all split areas into the parent area
    const mergedBlocks = splitAreas.flatMap((area) => area.blocks);
    const updatedDropArea: DropAreaType = {
      id: dropArea.id,
      blocks: mergedBlocks,
      isSplit: false,
      splitAreas: [],
      splitLevel: dropArea.splitLevel,
    };

    // Update the parent area in the main array
    const updatedDropAreas = dropAreas.map((area) =>
      area.id === dropAreaId ? updatedDropArea : area
    );

    set((state) => ({ ...state, dropAreas: updatedDropAreas }));
    // Removed misplaced import from here

    get().triggerAutoSave();
  },

  canSplit: (dropAreaId: string, viewport: ViewportType) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) {
      console.warn(`canSplit: Drop area ${dropAreaId} not found.`);
      return false;
    }

    // Define max split levels per viewport
    const maxSplitLevel: Record<ViewportType, number> = {
      mobile: 0, // No splitting on mobile
      tablet: 1, // Max 1 split (2 columns) on tablet
      desktop: 2, // Max 2 splits (4 columns) on desktop
    };

    const canSplitResult =
      !dropArea.isSplit && dropArea.splitLevel < maxSplitLevel[viewport];

    // console.log(
    //   `canSplit check for ${dropAreaId} (Level ${dropArea.splitLevel}) in ${viewport}: ${canSplitResult} (Max Level: ${maxSplitLevel[viewport]}, IsSplit: ${dropArea.isSplit})`
    // );

    return canSplitResult;
  },

  canMerge: (dropAreaId: string) => {
    const { dropAreas } = get();
    const dropArea = findDropAreaById(dropAreas, dropAreaId);
    if (!dropArea) return false;

    // Can only merge if it's split
    return dropArea.isSplit;
  },

  cleanupEmptyDropAreas: () => {
    const { dropAreas } = get();
    const newDropAreas = [...dropAreas];

    // Remove consecutive empty areas, keeping at least one
    let i = 0;
    while (i < newDropAreas.length - 1) {
      const currentArea = newDropAreas[i];
      const nextArea = newDropAreas[i + 1];

      if (isDropAreaEmpty(currentArea) && isDropAreaEmpty(nextArea)) {
        newDropAreas.splice(i + 1, 1);
      } else {
        i++;
      }
    }

    // Ensure at least one empty area at the end
    const lastArea = newDropAreas[newDropAreas.length - 1];
    if (!isDropAreaEmpty(lastArea)) {
      const newArea: DropAreaType = {
        id: `drop-area-${Date.now()}`,
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      };
      newDropAreas.push(newArea);
    }

    set((state) => ({ ...state, dropAreas: newDropAreas }));
    get().triggerAutoSave();
  },
});

```

# store/blocks/index.ts

```ts
import { create } from "zustand";
import type { BlocksState, BlocksBaseState } from "./types";
import { createBlockActions } from "./block-actions";
import { createDropAreaActions } from "./drop-area-actions";
import { createProjectActions } from "./project-actions";
import { createUIStateActions } from "./ui-state-actions";

// Auto-save debounce time in milliseconds
const AUTO_SAVE_DEBOUNCE = 2000;

export const useBlocksStore = create<BlocksState>((set, get, store) => {
  // Create a debounced auto-save function
  let autoSaveTimeout: NodeJS.Timeout | null = null;
  const triggerAutoSave = () => {
    if (!get().autoSaveEnabled) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(async () => {
      const { currentProjectTitle } = get();
      if (currentProjectTitle) {
        await get().saveProject(currentProjectTitle);
      }
    }, AUTO_SAVE_DEBOUNCE);
  };

  // Initial state
  const initialState: BlocksBaseState = {
    dropAreas: [
      {
        id: "drop-area-1",
        blocks: [],
        isSplit: false,
        splitAreas: [],
        splitLevel: 0,
      },
    ],
    currentProjectId: null,
    currentProjectTitle: null,
    selectedBlockId: null,
    previewMode: false,
    viewport: "desktop",
    isLoading: false,
    isSaving: false,
    autoSaveEnabled: true,
    lastSaved: null,
    triggerAutoSave,
  };

  // Create actions
  const blockActions = createBlockActions(set, get);
  const dropAreaActions = createDropAreaActions(set, get);
  const projectActions = createProjectActions(set, get);
  const uiStateActions = createUIStateActions(set, get);

  return {
    ...initialState,
    ...blockActions,
    ...dropAreaActions,
    ...projectActions,
    ...uiStateActions,
  };
});

```

# store/blocks/project-actions.ts

```ts
import type { BlocksState } from "./types";
import type { ProjectData } from "@/lib/types";
import {
  saveProjectToStorage,
  loadProjectFromStorage,
} from "@/lib/supabase/storage";
import { isEmptyProject } from "./utils";

export const createProjectActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  loadProject: async (projectId: string) => {
    set((state) => ({ ...state, isLoading: true }));
    console.log(`Loading project: ${projectId}`);

    try {
      const projectData = await loadProjectFromStorage(projectId);
      if (!projectData) {
        console.error(`Project ${projectId} not found`);
        set((state) => ({ ...state, isLoading: false }));
        return false;
      }

      const dropAreasCopy = JSON.parse(JSON.stringify(projectData.dropAreas));
      set((state) => ({
        ...state,
        dropAreas: dropAreasCopy,
        currentProjectId: projectData.id,
        currentProjectTitle: projectData.title,
        isLoading: false,
        lastSaved: new Date(projectData.updatedAt),
      }));

      return true;
    } catch (error) {
      console.error(`Error loading project ${projectId}:`, error);
      set((state) => ({ ...state, isLoading: false }));
      return false;
    }
  },

  saveProject: async (projectTitle: string, description?: string): Promise<boolean> => {
    const { dropAreas, currentProjectId } = get();
    if (!currentProjectId) {
      const newId = await get().createNewProject(projectTitle, description);
      return !!newId;
    }

    set((state) => ({ ...state, isSaving: true }));
    try {
      const existingProjectData = await loadProjectFromStorage(
        currentProjectId
      );
      const projectData: ProjectData = {
        id: currentProjectId,
        title: projectTitle,
        description,
        dropAreas,
        createdAt: existingProjectData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToStorage(projectData);
      set((state) => ({
        ...state,
        currentProjectTitle: projectTitle,
        isSaving: false,
        lastSaved: success ? new Date() : null,
      }));

      return success;
    } catch (error) {
      console.error(`Error saving project ${currentProjectId}:`, error);
      set((state) => ({ ...state, isSaving: false }));
      return false;
    }
  },

  createNewProject: async (title: string, description?: string) => {
    const { currentProjectId, dropAreas } = get();

    if (currentProjectId && isEmptyProject(dropAreas)) {
      set((state) => ({
        ...state,
        currentProjectTitle: title || "Untitled Project",
        lastSaved: new Date(),
      }));
      return currentProjectId;
    }

    set((state) => ({ ...state, isSaving: true }));
    try {
      const newProjectId = `project-${Date.now()}`;
      const projectData: ProjectData = {
        id: newProjectId,
        title: title || "Untitled Project",
        description,
        dropAreas: [
          {
            id: "drop-area-1",
            blocks: [],
            isSplit: false,
            splitAreas: [],
            splitLevel: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToStorage(projectData);
      if (!success) {
        set((state) => ({ ...state, isSaving: false }));
        return null;
      }

      set((state) => ({
        ...state,
        dropAreas: projectData.dropAreas,
        currentProjectId: newProjectId,
        currentProjectTitle: projectData.title,
        isSaving: false,
        lastSaved: new Date(),
      }));

      return newProjectId;
    } catch (error) {
      console.error("Error creating new project:", error);
      set((state) => ({ ...state, isSaving: false }));
      return null;
    }
  },

  setProjectTitle: (title: string) => {
    set((state) => ({ ...state, currentProjectTitle: title }));
    get().triggerAutoSave();
  },
});

```

# store/blocks/types.ts

```ts
import type { BlockType, DropAreaType } from "@/lib/types";
import type { ViewportType } from "@/lib/hooks/use-viewport";

// Base state without actions
export interface BlocksBaseState {
  // Project state
  dropAreas: DropAreaType[];
  currentProjectId: string | null;
  currentProjectTitle: string | null;

  // UI state
  selectedBlockId: string | null;
  previewMode: boolean;
  viewport: ViewportType;

  // Loading and saving state
  isLoading: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  triggerAutoSave: () => void;
}

// Actions
export interface BlockActions {
  addBlock: (block: Omit<BlockType, "id">, dropAreaId: string) => void;
  moveBlock: (
    blockId: string,
    sourceAreaId: string,
    targetAreaId: string
  ) => void;
  deleteBlock: (blockId: string, dropAreaId: string) => void;
  updateBlockContent: (
    blockId: string,
    dropAreaId: string,
    content: string,
    additionalProps?: Partial<BlockType>
  ) => void;
}

export interface DropAreaActions {
  splitDropArea: (dropAreaId: string) => void;
  mergeDropAreas: (dropAreaId: string) => void;
  canSplit: (dropAreaId: string, viewport: ViewportType) => boolean; // Updated signature
  canMerge: (dropAreaId: string) => boolean;
  cleanupEmptyDropAreas: () => void;
}

export interface ProjectActions {
  loadProject: (projectId: string) => Promise<boolean>;
  saveProject: (projectTitle: string, description?: string) => Promise<boolean>;
  createNewProject: (
    title: string,
    description?: string
  ) => Promise<string | null>;
  setProjectTitle: (title: string) => void;
}

export interface UIStateActions {
  setSelectedBlockId: (blockId: string | null) => void;
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  toggleAutoSave: () => void;
  setViewport: (viewport: ViewportType) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
}

// Combined state type
export type BlocksState = BlocksBaseState &
  BlockActions &
  DropAreaActions &
  ProjectActions &
  UIStateActions;

```

# store/blocks/ui-state-actions.ts

```ts
import type { BlocksState } from "./types";
import type { ViewportType } from "@/lib/hooks/use-viewport";

export const createUIStateActions = (
  set: (fn: (state: BlocksState) => Partial<BlocksState>) => void,
  get: () => BlocksState
) => ({
  // Block selection
  setSelectedBlockId: (blockId: string | null) => {
    set((state) => ({ ...state, selectedBlockId: blockId }));
  },

  // Preview mode
  setPreviewMode: (enabled: boolean) => {
    set((state) => ({ ...state, previewMode: enabled }));
  },

  togglePreviewMode: () => {
    const { previewMode } = get();
    set((state) => ({ ...state, previewMode: !previewMode }));
  },

  // Auto-save
  setAutoSaveEnabled: (enabled: boolean) => {
    set((state) => ({ ...state, autoSaveEnabled: enabled }));
  },

  toggleAutoSave: () => {
    const { autoSaveEnabled } = get();
    set((state) => ({ ...state, autoSaveEnabled: !autoSaveEnabled }));
  },

  // Viewport
  setViewport: (viewport: ViewportType) => {
    set((state) => ({ ...state, viewport }));
  },

  // Loading and saving states
  setIsLoading: (isLoading: boolean) => {
    set((state) => ({ ...state, isLoading }));
  },

  setIsSaving: (isSaving: boolean) => {
    set((state) => ({ ...state, isSaving }));
  },

  setLastSaved: (lastSaved: Date | null) => {
    set((state) => ({ ...state, lastSaved }));
  },
});

```

# store/blocks/utils.ts

```ts
import type { BlockType, DropAreaType } from "@/lib/types";

// Debounce helper function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const findDropAreaById = (
  dropAreas: DropAreaType[],
  id: string
): DropAreaType | null => {
  for (const area of dropAreas) {
    if (area.id === id) return area;
  }
  return null;
};

export const findBlockById = (
  dropAreas: DropAreaType[],
  blockId: string
): BlockType | null => {
  for (const area of dropAreas) {
    const block = area.blocks.find((b) => b.id === blockId);
    if (block) return block;
  }
  return null;
};

export const isDropAreaEmpty = (dropArea: DropAreaType): boolean => {
  return dropArea.blocks.length === 0 && !dropArea.isSplit;
};

export const isEmptyProject = (dropAreas: DropAreaType[]): boolean => {
  return dropAreas.length === 1 && isDropAreaEmpty(dropAreas[0]);
};

export const canMergeAreas = (
  firstArea: DropAreaType,
  secondArea: DropAreaType
): boolean => {
  return firstArea.splitLevel === secondArea.splitLevel;
};

// Helper function to create a new empty drop area
export function createEmptyDropArea(id: string): DropAreaType {
  return {
    id,
    blocks: [],
    isSplit: false,
    splitAreas: [],
    splitLevel: 0,
  };
}

// Helper function to create a trace ID for logging
export function createTraceId(operation: string): string {
  return `${operation}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

```

# store/board-store.ts

```ts
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type Item = {
  id: string;
  content: string;
  columnId: string;
};

export type Column = {
  id: string;
  title: string;
  items: Item[];
};

export type Board = {
  columns: Column[];
};

interface BoardState {
  board: Board;
  isLoading: boolean;
  fetchBoard: () => Promise<void>;
  moveItem: (
    itemId: string,
    sourceColumnId: string,
    destinationColumnId: string
  ) => void;
  addItem: (columnId: string, content: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => {
  // Get the Supabase client - only in browser
  const getSupabase = () => {
    if (typeof window === "undefined") return null;
    return createClient();
  };

  return {
    board: {
      columns: [],
    },
    isLoading: false,

    fetchBoard: async () => {
      set({ isLoading: true });
      const supabase = getSupabase();
      if (!supabase) {
        set({ isLoading: false });
        return;
      }

      try {
        // Fetch columns
        const { data: columns, error: columnsError } = await supabase
          .from("columns")
          .select("*")
          .order("position");

        if (columnsError) throw columnsError;

        // Fetch items
        const { data: items, error: itemsError } = await supabase
          .from("items")
          .select("*");

        if (itemsError) throw itemsError;

        // Organize items into columns
        const columnsWithItems = columns.map((column: any) => ({
          id: column.id,
          title: column.title,
          items: items
            .filter((item: any) => item.column_id === column.id)
            .map((item: any) => ({
              id: item.id,
              content: item.content,
              columnId: item.column_id,
            })),
        }));

        set({
          board: {
            columns: columnsWithItems,
          },
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching board:", error);
        set({ isLoading: false });
      }
    },

    moveItem: (itemId, sourceColumnId, destinationColumnId) => {
      const board = get().board;
      const sourceColumnIndex = board.columns.findIndex(
        (col) => col.id === sourceColumnId
      );
      const destinationColumnIndex = board.columns.findIndex(
        (col) => col.id === destinationColumnId
      );

      if (sourceColumnIndex === -1 || destinationColumnIndex === -1) return;

      const sourceColumn = board.columns[sourceColumnIndex];
      const itemIndex = sourceColumn.items.findIndex(
        (item) => item.id === itemId
      );

      if (itemIndex === -1) return;

      // Create a copy of the board
      const newBoard = { ...board };

      // Remove the item from the source column
      const [movedItem] = newBoard.columns[sourceColumnIndex].items.splice(
        itemIndex,
        1
      );

      // Update the item's columnId
      movedItem.columnId = destinationColumnId;

      // Add the item to the destination column
      newBoard.columns[destinationColumnIndex].items.push(movedItem);

      // Update the state
      set({ board: newBoard });

      // Update in Supabase
      const supabase = getSupabase();
      if (supabase) {
        supabase
          .from("items")
          .update({ column_id: destinationColumnId })
          .eq("id", itemId)
          .then(({ error }) => {
            if (error) throw new Error(`Error updating item: ${error.message}`);
          });
      }
    },

    addItem: async (columnId, content) => {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("items")
          .insert([{ content, column_id: columnId }])
          .select();

        if (error) throw new Error(`Error adding item: ${error.message}`);

        const newItem = {
          id: data[0].id,
          content: data[0].content,
          columnId: data[0].column_id,
        };

        const board = get().board;
        const columnIndex = board.columns.findIndex(
          (col) => col.id === columnId
        );

        if (columnIndex === -1) return;

        const newBoard = { ...board };
        newBoard.columns[columnIndex].items.push(newItem);

        set({ board: newBoard });
      } catch (error) {
        console.error("Error adding item:", error);
      }
    },
  };
});

```

# store/editor-store.ts

```ts
import { create } from "zustand";

interface EditorState {
  // Editor state
  isFocused: boolean;
  activeFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    paragraph: boolean;
    bulletList: boolean;
    orderedList: boolean;
    blockquote: boolean;
    link: boolean;
    heading1: boolean;
    heading2: boolean;
    heading3: boolean;
    heading4: boolean;
    heading5: boolean;
    heading6: boolean;
  };
  // Actions
  setFocus: (focused: boolean) => void;
  updateActiveFormats: (formats: Partial<EditorState["activeFormats"]>) => void;
  resetFormats: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  isFocused: false,
  activeFormats: {
    bold: false,
    italic: false,
    underline: false,
    paragraph: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    link: false,
    heading1: false,
    heading2: false,
    heading3: false,
    heading4: false,
    heading5: false,
    heading6: false,
  },

  // Actions
  setFocus: (focused) => set({ isFocused: focused }),
  updateActiveFormats: (formats) =>
    set((state) => ({
      activeFormats: { ...state.activeFormats, ...formats },
    })),
  resetFormats: () =>
    set({
      activeFormats: {
        bold: false,
        italic: false,
        underline: false,
        paragraph: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        link: false,
        heading1: false,
        heading2: false,
        heading3: false,
        heading4: false,
        heading5: false,
        heading6: false,
      },
    }),
}));

```

# store/media-library-store.ts

```ts
import { create } from "zustand";
import type { MediaItem, MediaLibraryState } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface MediaLibraryStore extends MediaLibraryState {
  // Media Item Actions
  addItem: (item: MediaItem) => void;
  removeItem: (id: string) => void;

  // Fetch Actions
  fetchItems: (page?: number) => Promise<void>;
  searchItems: (query: string) => Promise<MediaItem[]>;

  // State Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

const ITEMS_PER_PAGE = 20;

export const useMediaLibraryStore = create<MediaLibraryStore>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
  itemsPerPage: ITEMS_PER_PAGE,

  // Media Item Actions
  addItem: (item) => {
    set((state) => ({
      items: [item, ...state.items],
    }));
  },

  removeItem: async (id) => {
    try {
      // First remove from Supabase storage
      const item = get().items.find((i) => i.id === id);
      if (item) {
        // Extract file path from URL
        const filePath = new URL(item.url).pathname.split("/").pop();
        if (filePath) {
          const { error } = await supabase.storage
            .from("images")
            .remove([filePath]);

          if (error) throw error;
        }
      }

      // Then remove from store
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error("Error removing item:", error);
      set({ error: "Failed to remove item from media library" });
    }
  },

  // Fetch Actions
  fetchItems: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });

      // Calculate offset based on page
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Fetch items from Supabase
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .order("uploadedAt", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Update state
      set((state) => ({
        items: page === 1 ? data : [...state.items, ...data],
        page,
        hasMore: data.length === ITEMS_PER_PAGE,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching media items:", error);
      set({
        error: "Failed to fetch media items",
        isLoading: false,
      });
    }
  },

  searchItems: async (query) => {
    try {
      set({ isLoading: true, error: null });

      // Search in Supabase
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .ilike("fileName", `%${query}%`)
        .order("uploadedAt", { ascending: false })
        .limit(ITEMS_PER_PAGE);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching media items:", error);
      set({
        error: "Failed to search media items",
        isLoading: false,
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // State Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetState: () =>
    set({
      items: [],
      isLoading: false,
      error: null,
      page: 1,
      hasMore: true,
    }),
}));

```

# store/store.ts

```ts
import { create } from "zustand"

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))


```

# styles/tiptap.css

```css
/* Tiptap Editor Styles */
.tiptap-paragraph-editor {
  @apply prose max-w-none;
}

.tiptap-heading-editor {
  @apply prose max-w-none;
  min-height: 2.5rem !important; /* Base height matching h3 */
  height: auto !important;
}

.tiptap-heading-editor h1 {
  @apply my-0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3.5rem !important;
  line-height: 3.5rem !important;
}

.tiptap-heading-editor h2 {
  @apply my-0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3rem !important;
  line-height: 3rem !important;
}

.tiptap-heading-editor h3,
.tiptap-heading-editor h4,
.tiptap-heading-editor h5,
.tiptap-heading-editor h6 {
  @apply my-0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.5rem !important;
  line-height: 2.5rem !important;
}

.tiptap-heading-editor p {
  @apply my-0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.5rem !important;
  line-height: 2.5rem !important;
}

.tiptap-paragraph-editor p {
  @apply my-2;
}

.tiptap-paragraph-editor h1 {
  @apply text-4xl font-bold tracking-tight mt-4 mb-2;
}

.tiptap-paragraph-editor h2 {
  @apply text-3xl font-bold tracking-tight mt-4 mb-2;
}

.tiptap-paragraph-editor h3 {
  @apply text-2xl font-bold tracking-tight mt-3 mb-2;
}

.tiptap-paragraph-editor h4 {
  @apply text-xl font-bold tracking-tight mt-3 mb-2;
}

.tiptap-paragraph-editor h5 {
  @apply text-lg font-bold tracking-tight mt-2 mb-1;
}

.tiptap-paragraph-editor h6 {
  @apply text-base font-bold tracking-tight mt-2 mb-1;
}

.tiptap-paragraph-editor ul {
  @apply list-disc pl-6;
}

.tiptap-paragraph-editor ul li {
  @apply my-0;
}

.tiptap-paragraph-editor ol {
  @apply list-decimal pl-6;
}

.tiptap-paragraph-editor ol li {
  @apply my-0;
}

.tiptap-paragraph-editor blockquote {
  @apply border-l-4 border-gray-300 pl-4 my-2 italic;
}

.tiptap-paragraph-editor blockquote p {
  @apply my-0;
}

.tiptap-paragraph-editor strong {
  @apply font-bold;
}

.tiptap-paragraph-editor em {
  @apply italic;
}

.tiptap-paragraph-editor u {
  @apply underline;
}

/* Preview Styles */
.preview-content {
  @apply prose max-w-none;
}

.preview-content p {
  @apply my-2;
}

.preview-content h1 {
  @apply text-4xl font-bold tracking-tight mt-4 mb-2;
}

.preview-content h2 {
  @apply text-3xl font-bold tracking-tight mt-4 mb-2;
}

.preview-content h3 {
  @apply text-2xl font-bold tracking-tight mt-3 mb-2;
}

.preview-content h4 {
  @apply text-xl font-bold tracking-tight mt-3 mb-2;
}

.preview-content h5 {
  @apply text-lg font-bold tracking-tight mt-2 mb-1;
}

.preview-content h6 {
  @apply text-base font-bold tracking-tight mt-2 mb-1;
}

.preview-content ul {
  @apply list-disc pl-6;
}

.preview-content ul li {
  @apply my-0;
}

.preview-content ol {
  @apply list-decimal pl-6;
}

.preview-content ol li {
  @apply my-0;
}

.preview-content blockquote {
  @apply border-l-4 border-gray-300 pl-4 my-2 italic;
}

.preview-content blockquote p {
  @apply my-0;
}

.preview-content strong {
  @apply font-bold;
}

.preview-content em {
  @apply italic;
}

.preview-content u {
  @apply underline;
}

/* Emoji Picker Styles */
.emoji-picker-container {
  z-index: 100;
}

.emoji-picker-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Make sure emoji picker is always on top */
.tippy-box {
  z-index: 1000 !important;
}

/* Custom tippy theme */
.tippy-box[data-theme~="light-border"] {
  background-color: white;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.08);
  color: hsl(var(--foreground));
}

/* Remove the black border around the tippy box */
.tippy-box[data-theme~="light-border"] .tippy-content {
  padding: 0;
  border: none;
  background-color: transparent;
}

.tippy-box[data-animation="shift-away"][data-state="hidden"] {
  opacity: 0;
  transform: translateY(5px);
}

/* Custom styling for emoji picker to match site design */
.EmojiPickerReact {
  --epr-bg-color: white !important;
  --epr-category-label-bg-color: white !important;
  --epr-hover-bg-color: theme("colors.secondary.DEFAULT") !important;
  --epr-search-input-bg-color: theme("colors.white") !important;
  --epr-search-input-border-color: theme("colors.border") !important;
  --epr-text-color: theme("colors.foreground") !important;
  --epr-highlight-color: theme("colors.primary.DEFAULT") !important;

  border-radius: var(--radius) !important;
  box-shadow: none !important;
  border: none !important;
  max-height: 350px !important;
  overflow: hidden !important;
  background-color: white !important;
}

/* Ensure no borders at the edges of the picker */
.EmojiPickerReact,
.EmojiPickerReact .epr-body,
.EmojiPickerReact .epr-emoji-category-content {
  border: none !important;
}

.EmojiPickerReact .epr-search-container input {
  border-radius: var(--radius) !important;
  border: 1px solid theme("colors.border") !important;
}

.EmojiPickerReact .epr-category-nav {
  padding: 8px !important;
  background-color: white !important;
}

.EmojiPickerReact .epr-emoji-category-label {
  font-family: var(--font-sans) !important;
  font-size: 0.8rem !important;
  background-color: white !important;
}

.EmojiPickerReact .epr-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.EmojiPickerReact .epr-body::-webkit-scrollbar-track {
  background: transparent;
}

.EmojiPickerReact .epr-body::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 4px;
}

.EmojiPickerReact .epr-body::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

```

# supabase/.gitignore

```
# Supabase
.branches
.temp

# dotenvx
.env.keys
.env.local
.env.*.local

```

# supabase/.temp/cli-latest

```
v2.20.12
```

# supabase/config.toml

```toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "boards-klon"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 1

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "text-blink": {
          "0%, 75%": { opacity: "1" },
          "75.1%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "text-blink": "text-blink 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;

export default config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# tsconfig.tsbuildinfo

```tsbuildinfo
{"fileNames":["./node_modules/typescript/lib/lib.es5.d.ts","./node_modules/typescript/lib/lib.es2015.d.ts","./node_modules/typescript/lib/lib.es2016.d.ts","./node_modules/typescript/lib/lib.es2017.d.ts","./node_modules/typescript/lib/lib.es2018.d.ts","./node_modules/typescript/lib/lib.es2019.d.ts","./node_modules/typescript/lib/lib.es2020.d.ts","./node_modules/typescript/lib/lib.es2021.d.ts","./node_modules/typescript/lib/lib.es2022.d.ts","./node_modules/typescript/lib/lib.es2023.d.ts","./node_modules/typescript/lib/lib.es2024.d.ts","./node_modules/typescript/lib/lib.esnext.d.ts","./node_modules/typescript/lib/lib.dom.d.ts","./node_modules/typescript/lib/lib.dom.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.core.d.ts","./node_modules/typescript/lib/lib.es2015.collection.d.ts","./node_modules/typescript/lib/lib.es2015.generator.d.ts","./node_modules/typescript/lib/lib.es2015.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.promise.d.ts","./node_modules/typescript/lib/lib.es2015.proxy.d.ts","./node_modules/typescript/lib/lib.es2015.reflect.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2016.array.include.d.ts","./node_modules/typescript/lib/lib.es2016.intl.d.ts","./node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2017.date.d.ts","./node_modules/typescript/lib/lib.es2017.object.d.ts","./node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2017.string.d.ts","./node_modules/typescript/lib/lib.es2017.intl.d.ts","./node_modules/typescript/lib/lib.es2017.typedarrays.d.ts","./node_modules/typescript/lib/lib.es2018.asyncgenerator.d.ts","./node_modules/typescript/lib/lib.es2018.asynciterable.d.ts","./node_modules/typescript/lib/lib.es2018.intl.d.ts","./node_modules/typescript/lib/lib.es2018.promise.d.ts","./node_modules/typescript/lib/lib.es2018.regexp.d.ts","./node_modules/typescript/lib/lib.es2019.array.d.ts","./node_modules/typescript/lib/lib.es2019.object.d.ts","./node_modules/typescript/lib/lib.es2019.string.d.ts","./node_modules/typescript/lib/lib.es2019.symbol.d.ts","./node_modules/typescript/lib/lib.es2019.intl.d.ts","./node_modules/typescript/lib/lib.es2020.bigint.d.ts","./node_modules/typescript/lib/lib.es2020.date.d.ts","./node_modules/typescript/lib/lib.es2020.promise.d.ts","./node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2020.string.d.ts","./node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2020.intl.d.ts","./node_modules/typescript/lib/lib.es2020.number.d.ts","./node_modules/typescript/lib/lib.es2021.promise.d.ts","./node_modules/typescript/lib/lib.es2021.string.d.ts","./node_modules/typescript/lib/lib.es2021.weakref.d.ts","./node_modules/typescript/lib/lib.es2021.intl.d.ts","./node_modules/typescript/lib/lib.es2022.array.d.ts","./node_modules/typescript/lib/lib.es2022.error.d.ts","./node_modules/typescript/lib/lib.es2022.intl.d.ts","./node_modules/typescript/lib/lib.es2022.object.d.ts","./node_modules/typescript/lib/lib.es2022.string.d.ts","./node_modules/typescript/lib/lib.es2022.regexp.d.ts","./node_modules/typescript/lib/lib.es2023.array.d.ts","./node_modules/typescript/lib/lib.es2023.collection.d.ts","./node_modules/typescript/lib/lib.es2023.intl.d.ts","./node_modules/typescript/lib/lib.es2024.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2024.collection.d.ts","./node_modules/typescript/lib/lib.es2024.object.d.ts","./node_modules/typescript/lib/lib.es2024.promise.d.ts","./node_modules/typescript/lib/lib.es2024.regexp.d.ts","./node_modules/typescript/lib/lib.es2024.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2024.string.d.ts","./node_modules/typescript/lib/lib.esnext.array.d.ts","./node_modules/typescript/lib/lib.esnext.collection.d.ts","./node_modules/typescript/lib/lib.esnext.intl.d.ts","./node_modules/typescript/lib/lib.esnext.disposable.d.ts","./node_modules/typescript/lib/lib.esnext.promise.d.ts","./node_modules/typescript/lib/lib.esnext.decorators.d.ts","./node_modules/typescript/lib/lib.esnext.iterator.d.ts","./node_modules/typescript/lib/lib.esnext.float16.d.ts","./node_modules/typescript/lib/lib.decorators.d.ts","./node_modules/typescript/lib/lib.decorators.legacy.d.ts","./node_modules/next/dist/styled-jsx/types/css.d.ts","./node_modules/@types/react/global.d.ts","./node_modules/csstype/index.d.ts","./node_modules/@types/prop-types/index.d.ts","./node_modules/@types/react/index.d.ts","./node_modules/next/dist/styled-jsx/types/index.d.ts","./node_modules/next/dist/styled-jsx/types/macro.d.ts","./node_modules/next/dist/styled-jsx/types/style.d.ts","./node_modules/next/dist/styled-jsx/types/global.d.ts","./node_modules/next/dist/shared/lib/amp.d.ts","./node_modules/next/amp.d.ts","./node_modules/@types/node/compatibility/disposable.d.ts","./node_modules/@types/node/compatibility/indexable.d.ts","./node_modules/@types/node/compatibility/iterators.d.ts","./node_modules/@types/node/compatibility/index.d.ts","./node_modules/@types/node/globals.typedarray.d.ts","./node_modules/@types/node/buffer.buffer.d.ts","./node_modules/undici-types/header.d.ts","./node_modules/undici-types/readable.d.ts","./node_modules/undici-types/file.d.ts","./node_modules/undici-types/fetch.d.ts","./node_modules/undici-types/formdata.d.ts","./node_modules/undici-types/connector.d.ts","./node_modules/undici-types/client.d.ts","./node_modules/undici-types/errors.d.ts","./node_modules/undici-types/dispatcher.d.ts","./node_modules/undici-types/global-dispatcher.d.ts","./node_modules/undici-types/global-origin.d.ts","./node_modules/undici-types/pool-stats.d.ts","./node_modules/undici-types/pool.d.ts","./node_modules/undici-types/handlers.d.ts","./node_modules/undici-types/balanced-pool.d.ts","./node_modules/undici-types/agent.d.ts","./node_modules/undici-types/mock-interceptor.d.ts","./node_modules/undici-types/mock-agent.d.ts","./node_modules/undici-types/mock-client.d.ts","./node_modules/undici-types/mock-pool.d.ts","./node_modules/undici-types/mock-errors.d.ts","./node_modules/undici-types/proxy-agent.d.ts","./node_modules/undici-types/env-http-proxy-agent.d.ts","./node_modules/undici-types/retry-handler.d.ts","./node_modules/undici-types/retry-agent.d.ts","./node_modules/undici-types/api.d.ts","./node_modules/undici-types/interceptors.d.ts","./node_modules/undici-types/util.d.ts","./node_modules/undici-types/cookies.d.ts","./node_modules/undici-types/patch.d.ts","./node_modules/undici-types/websocket.d.ts","./node_modules/undici-types/eventsource.d.ts","./node_modules/undici-types/filereader.d.ts","./node_modules/undici-types/diagnostics-channel.d.ts","./node_modules/undici-types/content-type.d.ts","./node_modules/undici-types/cache.d.ts","./node_modules/undici-types/index.d.ts","./node_modules/@types/node/globals.d.ts","./node_modules/@types/node/assert.d.ts","./node_modules/@types/node/assert/strict.d.ts","./node_modules/@types/node/async_hooks.d.ts","./node_modules/@types/node/buffer.d.ts","./node_modules/@types/node/child_process.d.ts","./node_modules/@types/node/cluster.d.ts","./node_modules/@types/node/console.d.ts","./node_modules/@types/node/constants.d.ts","./node_modules/@types/node/crypto.d.ts","./node_modules/@types/node/dgram.d.ts","./node_modules/@types/node/diagnostics_channel.d.ts","./node_modules/@types/node/dns.d.ts","./node_modules/@types/node/dns/promises.d.ts","./node_modules/@types/node/domain.d.ts","./node_modules/@types/node/dom-events.d.ts","./node_modules/@types/node/events.d.ts","./node_modules/@types/node/fs.d.ts","./node_modules/@types/node/fs/promises.d.ts","./node_modules/@types/node/http.d.ts","./node_modules/@types/node/http2.d.ts","./node_modules/@types/node/https.d.ts","./node_modules/@types/node/inspector.d.ts","./node_modules/@types/node/module.d.ts","./node_modules/@types/node/net.d.ts","./node_modules/@types/node/os.d.ts","./node_modules/@types/node/path.d.ts","./node_modules/@types/node/perf_hooks.d.ts","./node_modules/@types/node/process.d.ts","./node_modules/@types/node/punycode.d.ts","./node_modules/@types/node/querystring.d.ts","./node_modules/@types/node/readline.d.ts","./node_modules/@types/node/readline/promises.d.ts","./node_modules/@types/node/repl.d.ts","./node_modules/@types/node/sea.d.ts","./node_modules/@types/node/stream.d.ts","./node_modules/@types/node/stream/promises.d.ts","./node_modules/@types/node/stream/consumers.d.ts","./node_modules/@types/node/stream/web.d.ts","./node_modules/@types/node/string_decoder.d.ts","./node_modules/@types/node/test.d.ts","./node_modules/@types/node/timers.d.ts","./node_modules/@types/node/timers/promises.d.ts","./node_modules/@types/node/tls.d.ts","./node_modules/@types/node/trace_events.d.ts","./node_modules/@types/node/tty.d.ts","./node_modules/@types/node/url.d.ts","./node_modules/@types/node/util.d.ts","./node_modules/@types/node/v8.d.ts","./node_modules/@types/node/vm.d.ts","./node_modules/@types/node/wasi.d.ts","./node_modules/@types/node/worker_threads.d.ts","./node_modules/@types/node/zlib.d.ts","./node_modules/@types/node/index.d.ts","./node_modules/next/dist/server/get-page-files.d.ts","./node_modules/@types/react/canary.d.ts","./node_modules/@types/react/experimental.d.ts","./node_modules/@types/react-dom/index.d.ts","./node_modules/@types/react-dom/canary.d.ts","./node_modules/@types/react-dom/experimental.d.ts","./node_modules/next/dist/compiled/webpack/webpack.d.ts","./node_modules/next/dist/server/config.d.ts","./node_modules/next/dist/lib/load-custom-routes.d.ts","./node_modules/next/dist/shared/lib/image-config.d.ts","./node_modules/next/dist/build/webpack/plugins/subresource-integrity-plugin.d.ts","./node_modules/next/dist/server/body-streams.d.ts","./node_modules/next/dist/server/future/route-kind.d.ts","./node_modules/next/dist/server/future/route-definitions/route-definition.d.ts","./node_modules/next/dist/server/future/route-matches/route-match.d.ts","./node_modules/next/dist/client/components/app-router-headers.d.ts","./node_modules/next/dist/server/request-meta.d.ts","./node_modules/next/dist/server/lib/revalidate.d.ts","./node_modules/next/dist/server/config-shared.d.ts","./node_modules/next/dist/server/base-http/index.d.ts","./node_modules/next/dist/server/api-utils/index.d.ts","./node_modules/next/dist/server/node-environment.d.ts","./node_modules/next/dist/server/require-hook.d.ts","./node_modules/next/dist/server/node-polyfill-crypto.d.ts","./node_modules/next/dist/lib/page-types.d.ts","./node_modules/next/dist/build/analysis/get-page-static-info.d.ts","./node_modules/next/dist/build/webpack/loaders/get-module-build-info.d.ts","./node_modules/next/dist/build/webpack/plugins/middleware-plugin.d.ts","./node_modules/next/dist/server/render-result.d.ts","./node_modules/next/dist/server/future/helpers/i18n-provider.d.ts","./node_modules/next/dist/server/web/next-url.d.ts","./node_modules/next/dist/compiled/@edge-runtime/cookies/index.d.ts","./node_modules/next/dist/server/web/spec-extension/cookies.d.ts","./node_modules/next/dist/server/web/spec-extension/request.d.ts","./node_modules/next/dist/server/web/spec-extension/fetch-event.d.ts","./node_modules/next/dist/server/web/spec-extension/response.d.ts","./node_modules/next/dist/server/web/types.d.ts","./node_modules/next/dist/lib/setup-exception-listeners.d.ts","./node_modules/next/dist/lib/constants.d.ts","./node_modules/next/dist/build/index.d.ts","./node_modules/next/dist/build/webpack/plugins/pages-manifest-plugin.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-regex.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-matcher.d.ts","./node_modules/next/dist/shared/lib/router/utils/parse-url.d.ts","./node_modules/next/dist/server/base-http/node.d.ts","./node_modules/next/dist/server/font-utils.d.ts","./node_modules/next/dist/build/webpack/plugins/flight-manifest-plugin.d.ts","./node_modules/next/dist/server/future/route-modules/route-module.d.ts","./node_modules/next/dist/shared/lib/deep-readonly.d.ts","./node_modules/next/dist/server/load-components.d.ts","./node_modules/next/dist/shared/lib/router/utils/middleware-route-matcher.d.ts","./node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.d.ts","./node_modules/next/dist/server/future/route-definitions/locale-route-definition.d.ts","./node_modules/next/dist/server/future/route-definitions/pages-route-definition.d.ts","./node_modules/next/dist/shared/lib/mitt.d.ts","./node_modules/next/dist/client/with-router.d.ts","./node_modules/next/dist/client/router.d.ts","./node_modules/next/dist/client/route-loader.d.ts","./node_modules/next/dist/client/page-loader.d.ts","./node_modules/next/dist/shared/lib/bloom-filter.d.ts","./node_modules/next/dist/shared/lib/router/router.d.ts","./node_modules/next/dist/shared/lib/router-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/image-config-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.d.ts","./node_modules/next/dist/server/future/route-definitions/app-page-route-definition.d.ts","./node_modules/next/dist/shared/lib/modern-browserslist-target.d.ts","./node_modules/next/dist/shared/lib/constants.d.ts","./node_modules/next/dist/build/webpack/loaders/metadata/types.d.ts","./node_modules/next/dist/build/page-extensions-type.d.ts","./node_modules/next/dist/build/webpack/loaders/next-app-loader.d.ts","./node_modules/next/dist/server/lib/app-dir-module.d.ts","./node_modules/next/dist/server/response-cache/types.d.ts","./node_modules/next/dist/server/response-cache/index.d.ts","./node_modules/next/dist/server/lib/incremental-cache/index.d.ts","./node_modules/next/dist/client/components/hooks-server-context.d.ts","./node_modules/next/dist/server/app-render/dynamic-rendering.d.ts","./node_modules/next/dist/client/components/static-generation-async-storage-instance.d.ts","./node_modules/next/dist/client/components/static-generation-async-storage.external.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.d.ts","./node_modules/next/dist/server/async-storage/draft-mode-provider.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/headers.d.ts","./node_modules/next/dist/client/components/request-async-storage-instance.d.ts","./node_modules/next/dist/client/components/request-async-storage.external.d.ts","./node_modules/next/dist/server/app-render/create-error-handler.d.ts","./node_modules/next/dist/server/app-render/app-render.d.ts","./node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/amp-context.shared-runtime.d.ts","./node_modules/next/dist/server/future/route-modules/app-page/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/server/future/route-modules/app-page/module.compiled.d.ts","./node_modules/@types/react/jsx-runtime.d.ts","./node_modules/next/dist/client/components/error-boundary.d.ts","./node_modules/next/dist/client/components/router-reducer/create-initial-router-state.d.ts","./node_modules/next/dist/client/components/app-router.d.ts","./node_modules/next/dist/client/components/layout-router.d.ts","./node_modules/next/dist/client/components/render-from-template-context.d.ts","./node_modules/next/dist/client/components/action-async-storage-instance.d.ts","./node_modules/next/dist/client/components/action-async-storage.external.d.ts","./node_modules/next/dist/client/components/client-page.d.ts","./node_modules/next/dist/client/components/search-params.d.ts","./node_modules/next/dist/client/components/not-found-boundary.d.ts","./node_modules/next/dist/server/app-render/rsc/preloads.d.ts","./node_modules/next/dist/server/app-render/rsc/postpone.d.ts","./node_modules/next/dist/server/app-render/rsc/taint.d.ts","./node_modules/next/dist/server/app-render/entry-base.d.ts","./node_modules/next/dist/build/templates/app-page.d.ts","./node_modules/next/dist/server/future/route-modules/app-page/module.d.ts","./node_modules/next/dist/server/lib/builtin-request-context.d.ts","./node_modules/next/dist/server/app-render/types.d.ts","./node_modules/next/dist/client/components/router-reducer/fetch-server-response.d.ts","./node_modules/next/dist/client/components/router-reducer/router-reducer-types.d.ts","./node_modules/next/dist/shared/lib/app-router-context.shared-runtime.d.ts","./node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/server/future/route-modules/pages/module.compiled.d.ts","./node_modules/next/dist/build/templates/pages.d.ts","./node_modules/next/dist/server/future/route-modules/pages/module.d.ts","./node_modules/next/dist/server/render.d.ts","./node_modules/next/dist/server/future/route-definitions/pages-api-route-definition.d.ts","./node_modules/next/dist/server/future/route-matches/pages-api-route-match.d.ts","./node_modules/next/dist/server/future/route-matchers/route-matcher.d.ts","./node_modules/next/dist/server/future/route-matcher-providers/route-matcher-provider.d.ts","./node_modules/next/dist/server/future/route-matcher-managers/route-matcher-manager.d.ts","./node_modules/next/dist/server/future/normalizers/normalizer.d.ts","./node_modules/next/dist/server/future/normalizers/locale-route-normalizer.d.ts","./node_modules/next/dist/server/future/normalizers/request/pathname-normalizer.d.ts","./node_modules/next/dist/server/future/normalizers/request/suffix.d.ts","./node_modules/next/dist/server/future/normalizers/request/rsc.d.ts","./node_modules/next/dist/server/future/normalizers/request/prefix.d.ts","./node_modules/next/dist/server/future/normalizers/request/postponed.d.ts","./node_modules/next/dist/server/future/normalizers/request/action.d.ts","./node_modules/next/dist/server/future/normalizers/request/prefetch-rsc.d.ts","./node_modules/next/dist/server/future/normalizers/request/next-data.d.ts","./node_modules/next/dist/server/base-server.d.ts","./node_modules/next/dist/server/image-optimizer.d.ts","./node_modules/next/dist/server/next-server.d.ts","./node_modules/next/dist/lib/coalesced-function.d.ts","./node_modules/next/dist/server/lib/router-utils/types.d.ts","./node_modules/next/dist/trace/types.d.ts","./node_modules/next/dist/trace/trace.d.ts","./node_modules/next/dist/trace/shared.d.ts","./node_modules/next/dist/trace/index.d.ts","./node_modules/next/dist/build/load-jsconfig.d.ts","./node_modules/next/dist/build/webpack-config.d.ts","./node_modules/next/dist/build/webpack/plugins/define-env-plugin.d.ts","./node_modules/next/dist/build/swc/index.d.ts","./node_modules/next/dist/server/dev/parse-version-info.d.ts","./node_modules/next/dist/server/dev/hot-reloader-types.d.ts","./node_modules/next/dist/telemetry/storage.d.ts","./node_modules/next/dist/server/lib/types.d.ts","./node_modules/next/dist/server/lib/render-server.d.ts","./node_modules/next/dist/server/lib/router-server.d.ts","./node_modules/next/dist/shared/lib/router/utils/path-match.d.ts","./node_modules/next/dist/server/lib/router-utils/filesystem.d.ts","./node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.d.ts","./node_modules/next/dist/server/lib/dev-bundler-service.d.ts","./node_modules/next/dist/server/dev/static-paths-worker.d.ts","./node_modules/next/dist/server/dev/next-dev-server.d.ts","./node_modules/next/dist/server/next.d.ts","./node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts","./node_modules/next/dist/lib/metadata/types/extra-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-types.d.ts","./node_modules/next/dist/lib/metadata/types/manifest-types.d.ts","./node_modules/next/dist/lib/metadata/types/opengraph-types.d.ts","./node_modules/next/dist/lib/metadata/types/twitter-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts","./node_modules/next/types/index.d.ts","./node_modules/next/dist/shared/lib/html-context.shared-runtime.d.ts","./node_modules/@next/env/dist/index.d.ts","./node_modules/next/dist/shared/lib/utils.d.ts","./node_modules/next/dist/pages/_app.d.ts","./node_modules/next/app.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-cache.d.ts","./node_modules/next/dist/server/web/spec-extension/revalidate.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-no-store.d.ts","./node_modules/next/cache.d.ts","./node_modules/next/dist/shared/lib/runtime-config.external.d.ts","./node_modules/next/config.d.ts","./node_modules/next/dist/pages/_document.d.ts","./node_modules/next/document.d.ts","./node_modules/next/dist/shared/lib/dynamic.d.ts","./node_modules/next/dynamic.d.ts","./node_modules/next/dist/pages/_error.d.ts","./node_modules/next/error.d.ts","./node_modules/next/dist/shared/lib/head.d.ts","./node_modules/next/head.d.ts","./node_modules/next/dist/client/components/draft-mode.d.ts","./node_modules/next/dist/client/components/headers.d.ts","./node_modules/next/headers.d.ts","./node_modules/next/dist/shared/lib/get-img-props.d.ts","./node_modules/next/dist/client/image-component.d.ts","./node_modules/next/dist/shared/lib/image-external.d.ts","./node_modules/next/image.d.ts","./node_modules/next/dist/client/link.d.ts","./node_modules/next/link.d.ts","./node_modules/next/dist/client/components/redirect-status-code.d.ts","./node_modules/next/dist/client/components/redirect.d.ts","./node_modules/next/dist/client/components/not-found.d.ts","./node_modules/next/dist/client/components/navigation.react-server.d.ts","./node_modules/next/dist/client/components/navigation.d.ts","./node_modules/next/navigation.d.ts","./node_modules/next/router.d.ts","./node_modules/next/dist/client/script.d.ts","./node_modules/next/script.d.ts","./node_modules/next/dist/server/web/spec-extension/user-agent.d.ts","./node_modules/next/dist/compiled/@edge-runtime/primitives/url.d.ts","./node_modules/next/dist/server/web/spec-extension/image-response.d.ts","./node_modules/next/dist/compiled/@vercel/og/satori/index.d.ts","./node_modules/next/dist/compiled/@vercel/og/emoji/index.d.ts","./node_modules/next/dist/compiled/@vercel/og/types.d.ts","./node_modules/next/server.d.ts","./node_modules/next/types/global.d.ts","./node_modules/next/types/compiled.d.ts","./node_modules/next/index.d.ts","./node_modules/next/image-types/global.d.ts","./next-env.d.ts","./node_modules/@supabase/functions-js/dist/module/types.d.ts","./node_modules/@supabase/functions-js/dist/module/functionsclient.d.ts","./node_modules/@supabase/functions-js/dist/module/index.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgresterror.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/types.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/parser.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/types.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgrestbuilder.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/result.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgresttransformbuilder.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgrestfilterbuilder.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgrestquerybuilder.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/postgrestclient.d.ts","./node_modules/@supabase/postgrest-js/dist/cjs/index.d.ts","./node_modules/@types/ws/index.d.mts","./node_modules/@supabase/realtime-js/dist/module/lib/constants.d.ts","./node_modules/@supabase/realtime-js/dist/module/lib/serializer.d.ts","./node_modules/@supabase/realtime-js/dist/module/lib/timer.d.ts","./node_modules/@supabase/realtime-js/dist/module/lib/push.d.ts","./node_modules/@types/phoenix/index.d.ts","./node_modules/@supabase/realtime-js/dist/module/realtimepresence.d.ts","./node_modules/@supabase/realtime-js/dist/module/realtimechannel.d.ts","./node_modules/@supabase/realtime-js/dist/module/realtimeclient.d.ts","./node_modules/@supabase/realtime-js/dist/module/index.d.ts","./node_modules/@supabase/storage-js/dist/module/lib/errors.d.ts","./node_modules/@supabase/storage-js/dist/module/lib/types.d.ts","./node_modules/@supabase/storage-js/dist/module/lib/fetch.d.ts","./node_modules/@supabase/storage-js/dist/module/packages/storagefileapi.d.ts","./node_modules/@supabase/storage-js/dist/module/packages/storagebucketapi.d.ts","./node_modules/@supabase/storage-js/dist/module/storageclient.d.ts","./node_modules/@supabase/storage-js/dist/module/index.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/error-codes.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/errors.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/types.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/fetch.d.ts","./node_modules/@supabase/auth-js/dist/module/gotrueadminapi.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/helpers.d.ts","./node_modules/@supabase/auth-js/dist/module/gotrueclient.d.ts","./node_modules/@supabase/auth-js/dist/module/authadminapi.d.ts","./node_modules/@supabase/auth-js/dist/module/authclient.d.ts","./node_modules/@supabase/auth-js/dist/module/lib/locks.d.ts","./node_modules/@supabase/auth-js/dist/module/index.d.ts","./node_modules/@supabase/supabase-js/dist/module/lib/types.d.ts","./node_modules/@supabase/supabase-js/dist/module/lib/supabaseauthclient.d.ts","./node_modules/@supabase/supabase-js/dist/module/supabaseclient.d.ts","./node_modules/@supabase/supabase-js/dist/module/index.d.ts","./node_modules/cookie/dist/index.d.ts","./node_modules/@supabase/ssr/dist/main/types.d.ts","./node_modules/@supabase/ssr/dist/main/createbrowserclient.d.ts","./node_modules/@supabase/ssr/dist/main/createserverclient.d.ts","./node_modules/@supabase/ssr/dist/main/utils/helpers.d.ts","./node_modules/@supabase/ssr/dist/main/utils/constants.d.ts","./node_modules/@supabase/ssr/dist/main/utils/chunker.d.ts","./node_modules/@supabase/ssr/dist/main/utils/base64url.d.ts","./node_modules/@supabase/ssr/dist/main/utils/index.d.ts","./node_modules/@supabase/ssr/dist/main/index.d.ts","./lib/supabase/types.ts","./lib/supabase/middleware.ts","./middleware.ts","./node_modules/source-map-js/source-map.d.ts","./node_modules/postcss/lib/previous-map.d.ts","./node_modules/postcss/lib/input.d.ts","./node_modules/postcss/lib/css-syntax-error.d.ts","./node_modules/postcss/lib/declaration.d.ts","./node_modules/postcss/lib/root.d.ts","./node_modules/postcss/lib/warning.d.ts","./node_modules/postcss/lib/lazy-result.d.ts","./node_modules/postcss/lib/no-work-result.d.ts","./node_modules/postcss/lib/processor.d.ts","./node_modules/postcss/lib/result.d.ts","./node_modules/postcss/lib/document.d.ts","./node_modules/postcss/lib/rule.d.ts","./node_modules/postcss/lib/node.d.ts","./node_modules/postcss/lib/comment.d.ts","./node_modules/postcss/lib/container.d.ts","./node_modules/postcss/lib/at-rule.d.ts","./node_modules/postcss/lib/list.d.ts","./node_modules/postcss/lib/postcss.d.ts","./node_modules/postcss/lib/postcss.d.mts","./node_modules/tailwindcss/types/generated/corepluginlist.d.ts","./node_modules/tailwindcss/types/generated/colors.d.ts","./node_modules/tailwindcss/types/config.d.ts","./node_modules/tailwindcss/types/index.d.ts","./tailwind.config.ts","./lib/supabase/server.ts","./app/auth/actions.ts","./app/auth/callback/route.ts","./node_modules/@radix-ui/react-context/dist/index.d.mts","./node_modules/@radix-ui/react-primitive/dist/index.d.mts","./node_modules/@radix-ui/react-dismissable-layer/dist/index.d.mts","./node_modules/@radix-ui/react-toast/dist/index.d.mts","./node_modules/clsx/clsx.d.mts","./node_modules/class-variance-authority/dist/types.d.ts","./node_modules/class-variance-authority/dist/index.d.ts","./node_modules/lucide-react/dist/lucide-react.d.ts","./node_modules/tailwind-merge/dist/types.d.ts","./lib/utils.ts","./components/ui/toast.tsx","./components/ui/use-toast.ts","./hooks/use-toast.ts","./lib/constants.ts","./lib/icons.ts","./lib/item-types.ts","./lib/lucide-icons.ts","./lib/types.ts","./lib/mock-data.ts","./lib/supabase.ts","./node_modules/dnd-core/dist/interfaces.d.ts","./node_modules/dnd-core/dist/createdragdropmanager.d.ts","./node_modules/dnd-core/dist/index.d.ts","./node_modules/react-dnd/dist/core/dndcontext.d.ts","./node_modules/react-dnd/dist/core/dndprovider.d.ts","./node_modules/react-dnd/dist/types/options.d.ts","./node_modules/react-dnd/dist/types/connectors.d.ts","./node_modules/react-dnd/dist/types/monitors.d.ts","./node_modules/react-dnd/dist/types/index.d.ts","./node_modules/react-dnd/dist/core/dragpreviewimage.d.ts","./node_modules/react-dnd/dist/core/index.d.ts","./node_modules/react-dnd/dist/hooks/types.d.ts","./node_modules/react-dnd/dist/hooks/usedrag/usedrag.d.ts","./node_modules/react-dnd/dist/hooks/usedrag/index.d.ts","./node_modules/react-dnd/dist/hooks/usedragdropmanager.d.ts","./node_modules/react-dnd/dist/hooks/usedraglayer.d.ts","./node_modules/react-dnd/dist/hooks/usedrop/usedrop.d.ts","./node_modules/react-dnd/dist/hooks/usedrop/index.d.ts","./node_modules/react-dnd/dist/hooks/index.d.ts","./node_modules/react-dnd/dist/index.d.ts","./lib/hooks/use-block-drag.ts","./node_modules/zustand/esm/vanilla.d.mts","./node_modules/zustand/esm/react.d.mts","./node_modules/zustand/esm/index.d.mts","./lib/hooks/use-viewport.tsx","./lib/utils/drop-area-utils.ts","./lib/supabase/client.ts","./lib/supabase/storage.ts","./store/blocks-store.ts","./lib/hooks/use-drop-area.ts","./lib/supabase/database.ts","./lib/supabase/database.types.ts","./lib/supabase/supabase-browser.ts","./lib/supabase/supabase-middleware.ts","./lib/supabase/supabase-server.ts","./lib/utils/block-utils.ts","./lib/utils/viewport-utils.ts","./store/board-store.ts","./store/store.ts","./store/blocks/types.ts","./store/blocks/utils.ts","./store/blocks/area-state-checks.ts","./store/blocks/block-actions.ts","./store/blocks/drop-area-actions.ts","./store/blocks/project-actions.ts","./store/blocks/ui-state-actions.ts","./store/blocks/index.ts","./utils/supabase/client.ts","./utils/supabase/middleware.ts","./utils/supabase/server.ts","./node_modules/next/dist/compiled/@next/font/dist/types.d.ts","./node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts","./node_modules/next/font/google/index.d.ts","./components/providers/supabase-provider.tsx","./components/ui/toaster.tsx","./app/layout.tsx","./node_modules/@radix-ui/react-slot/dist/index.d.mts","./components/ui/button.tsx","./node_modules/@radix-ui/react-focus-scope/dist/index.d.mts","./node_modules/@radix-ui/react-portal/dist/index.d.mts","./node_modules/@radix-ui/react-dialog/dist/index.d.mts","./components/ui/sheet.tsx","./components/ui/dialog.tsx","./node_modules/@radix-ui/react-roving-focus/dist/index.d.mts","./node_modules/@radix-ui/react-tabs/dist/index.d.mts","./components/ui/tabs.tsx","./components/ui/input.tsx","./node_modules/@radix-ui/react-label/dist/index.d.mts","./components/ui/label.tsx","./components/ui/alert.tsx","./components/auth-modal.tsx","./node_modules/@radix-ui/react-arrow/dist/index.d.mts","./node_modules/@radix-ui/rect/dist/index.d.mts","./node_modules/@radix-ui/react-popper/dist/index.d.mts","./node_modules/@radix-ui/react-menu/dist/index.d.mts","./node_modules/@radix-ui/react-dropdown-menu/dist/index.d.mts","./components/ui/dropdown-menu.tsx","./components/navbar.tsx","./components/hero.tsx","./components/ui/card.tsx","./components/features.tsx","./components/footer.tsx","./app/page.tsx","./app/auth/auth-form.tsx","./components/auth/auth-form.tsx","./app/auth/page.tsx","./app/dashboard/loading.tsx","./node_modules/@radix-ui/react-alert-dialog/dist/index.d.mts","./components/ui/alert-dialog.tsx","./components/dashboard/project-card.tsx","./components/dashboard/dashboard-header.tsx","./components/layout/navbar.tsx","./app/dashboard/page.tsx","./app/editor/layout.tsx","./app/editor/loading.tsx","./node_modules/react-dnd-html5-backend/dist/getemptyimage.d.ts","./node_modules/react-dnd-html5-backend/dist/nativetypes.d.ts","./node_modules/react-dnd-html5-backend/dist/types.d.ts","./node_modules/react-dnd-html5-backend/dist/index.d.ts","./components/blocks/draggable-block.tsx","./components/layout/left-sidebar.tsx","./components/blocks/canvas-block.tsx","./components/canvas/drop-area/drop-area-content.tsx","./components/canvas/drop-area/drop-indicators.tsx","./components/canvas/drop-area/mobile-drop-area.tsx","./components/canvas/drop-area/merge-gap-indicator.tsx","./components/canvas/drop-area/tablet-drop-area.tsx","./components/canvas/drop-area/desktop-drop-area.tsx","./components/canvas/drop-area/drop-area.tsx","./components/canvas/viewport-selector.tsx","./components/canvas/drop-area/insertion-indicator.tsx","./components/canvas/canvas.tsx","./components/layout/right-sidebar.tsx","./components/preview/preview-block.tsx","./components/preview/preview-drop-area.tsx","./components/preview/preview.tsx","./app/editor/page.tsx","./components/dnd-provider.tsx","./components/draggable-item.tsx","./components/draggable-square.tsx","./components/drop-target.tsx","./components/user-auth-button.tsx","./components/auth/user-auth-button.tsx","./node_modules/@radix-ui/react-tooltip/dist/index.d.mts","./components/ui/tooltip.tsx","./components/blocks/heading-block.tsx","./components/canvas/drop-area.tsx","./.next/types/app/layout.ts","./.next/types/app/page.ts","./.next/types/app/dashboard/page.ts","./.next/types/app/editor/layout.ts","./.next/types/app/editor/page.ts","./node_modules/@types/json5/index.d.ts","./node_modules/@types/ws/index.d.ts"],"fileIdsList":[[97,139,355,606],[97,139,355,607],[97,139,355,630],[97,139,355,569],[97,139,355,596],[97,139,390,491],[85,97,139,192,193,194,492,501,571,580,582,583],[97,139,400,491],[97,139,378,390,563,598],[97,139],[85,97,139,390,501,505,511,541,571,580,603,604,605],[85,97,139],[85,97,139,390,501,533,538,541,542,571,605,612,614,623,625,626,629],[85,97,139,403,566,567,568],[97,139,591,592,594,595],[85,97,139,501,567,571,576,579,580,582,583],[85,97,139,390,501,567,571,579,580,582,583],[85,97,139,390,501,567,571],[85,97,139,508,511,534,538,542,549],[97,139,501,509,533],[85,97,139,501,571,580,590,638],[85,97,139,509,533,538,539,542,550,622,623,624],[85,97,139,501,509,511,533,538,542,615],[85,97,139,501,511,542,619,622],[85,97,139,501,511,538,542,543,616,617,618,620,621],[97,139,508],[97,139,501],[85,97,139,501,511,542,622],[97,139,501,538,571],[85,97,139,571,579],[85,97,139,501,503,511,541,571,590,593,602],[85,97,139,533,612],[97,139,509,533],[85,97,139,501,509,533],[97,139,501,593],[97,139,384],[97,139,501,571],[97,139,501,613],[85,97,139,384,390,501,542,567,571,580,590],[97,139,542],[85,97,139,384,390,501,567,571,575,584,590],[97,139,511,549],[97,139,511,627],[97,139,538,539,542,550,628],[85,97,139,452,540],[85,97,139,503,571,601],[85,97,139,500,503],[85,97,139,500,503,570],[85,97,139,503],[85,97,139,501,503,574],[85,97,139,501,503,589],[85,97,139,500,503,581],[85,97,139,500,501,503,574],[85,97,139,503,578],[85,97,139,497,500,501,503],[97,139,504,506],[85,97,139,503,637],[85,97,139,504],[85,97,139,390,492,501,571],[97,139,509,511,533],[85,97,139,509,511,533,538,539,542],[97,139,511],[97,139,452],[97,139,462,463],[97,139,511,540],[97,139,400,462,463],[97,139,378,462,463],[97,139,462,545],[97,139,400,462,545],[97,139,378,462,545],[97,139,498,502],[97,139,511,538],[97,139,538],[97,139,400,464],[97,139,403,404],[85,97,139,494,574],[85,97,139,495],[85,97,139,494,495,496,572,573],[85,97,139,494,495,588],[85,97,139,494,495,496,572,573,577,587],[85,97,139,494,495,585,586],[85,97,139,494,495],[85,97,139,281],[85,97,139,494,495,577],[85,97,139,494,495,496],[85,97,139,494,495,496,573,587],[97,139,442],[97,139,444],[97,139,439,440,441],[97,139,439,440,441,442,443],[97,139,439,440,442,444,445,446,447],[97,139,438,440],[97,139,440],[97,139,439,441],[97,139,406],[97,139,406,407],[97,139,409,413,414,415,416,417,418,419],[97,139,410,413],[97,139,413,417,418],[97,139,412,413,416],[97,139,413,415,417],[97,139,413,414,415],[97,139,412,413],[97,139,410,411,412,413],[97,139,413],[97,139,410,411],[97,139,409,410,412],[97,139,427,428,429],[97,139,428],[97,139,422,424,425,427,429],[97,139,421,422,423,424,428],[97,139,426,428],[97,139,449,452,454],[97,139,454,455,456,461],[97,139,453],[97,139,454],[97,139,457,458,459,460],[97,139,431,432,436],[97,139,432],[97,139,431,432,433],[97,139,188,431,432,433],[97,139,433,434,435],[97,139,408,420,430,448,449,451],[97,139,448,449],[97,139,420,430,448],[97,139,408,420,430,437,449,450],[97,136,139],[97,138,139],[139],[97,139,144,173],[97,139,140,145,151,152,159,170,181],[97,139,140,141,151,159],[92,93,94,97,139],[97,139,142,182],[97,139,143,144,152,160],[97,139,144,170,178],[97,139,145,147,151,159],[97,138,139,146],[97,139,147,148],[97,139,151],[97,139,149,151],[97,138,139,151],[97,139,151,152,153,170,181],[97,139,151,152,153,166,170,173],[97,134,139,186],[97,139,147,151,154,159,170,181],[97,139,151,152,154,155,159,170,178,181],[97,139,154,156,170,178,181],[95,96,97,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187],[97,139,151,157],[97,139,158,181,186],[97,139,147,151,159,170],[97,139,160],[97,139,161],[97,138,139,162],[97,136,137,138,139,140,141,142,143,144,145,146,147,148,149,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187],[97,139,164],[97,139,165],[97,139,151,166,167],[97,139,166,168,182,184],[97,139,151,170,171,173],[97,139,172,173],[97,139,170,171],[97,139,173],[97,139,174],[97,136,139,170],[97,139,151,176,177],[97,139,176,177],[97,139,144,159,170,178],[97,139,179],[97,139,159,180],[97,139,154,165,181],[97,139,144,182],[97,139,170,183],[97,139,158,184],[97,139,185],[97,139,144,151,153,162,170,181,184,186],[97,139,170,187],[85,97,139,192,193,194],[85,97,139,192,193],[85,89,97,139,191,356,399],[85,89,97,139,190,356,399],[82,83,84,97,139],[97,139,151,154,156,159,170,178,181,187,188],[97,139,498,499],[97,139,498],[97,139,514],[97,139,514,515],[90,97,139],[97,139,360],[97,139,362,363,364],[97,139,366],[97,139,197,207,213,215,356],[97,139,197,204,206,209,227],[97,139,207],[97,139,207,209,334],[97,139,262,280,295,402],[97,139,304],[97,139,197,207,214,248,258,331,332,402],[97,139,214,402],[97,139,207,258,259,260,402],[97,139,207,214,248,402],[97,139,402],[97,139,197,214,215,402],[97,139,288],[97,138,139,188,287],[85,97,139,281,282,283,301,302],[97,139,271],[97,139,270,272,376],[85,97,139,281,282,299],[97,139,277,302,388],[97,139,386,387],[97,139,221,385],[97,139,274],[97,138,139,188,221,237,270,271,272,273],[85,97,139,299,301,302],[97,139,299,301],[97,139,299,300,302],[97,139,165,188],[97,139,269],[97,138,139,188,206,208,265,266,267,268],[85,97,139,198,379],[85,97,139,181,188],[85,97,139,214,246],[85,97,139,214],[97,139,244,249],[85,97,139,245,359],[97,139,564],[85,89,97,139,154,188,190,191,356,397,398],[97,139,356],[97,139,196],[97,139,349,350,351,352,353,354],[97,139,351],[85,97,139,245,281,359],[85,97,139,281,357,359],[85,97,139,281,359],[97,139,154,188,208,359],[97,139,154,188,205,206,217,235,237,269,274,275,297,299],[97,139,266,269,274,282,284,285,286,288,289,290,291,292,293,294,402],[97,139,267],[85,97,139,165,188,206,207,235,237,238,240,265,297,298,302,356,402],[97,139,154,188,208,209,221,222,270],[97,139,154,188,207,209],[97,139,154,170,188,205,208,209],[97,139,154,165,181,188,205,206,207,208,209,214,217,218,228,229,231,234,235,237,238,239,240,264,265,298,299,307,309,312,314,317,319,320,321,322],[97,139,154,170,188],[97,139,197,198,199,205,206,356,359,402],[97,139,154,170,181,188,202,333,335,336,402],[97,139,165,181,188,202,205,208,225,229,231,232,233,238,265,312,323,325,331,345,346],[97,139,207,211,265],[97,139,205,207],[97,139,218,313],[97,139,315,316],[97,139,315],[97,139,313],[97,139,315,318],[97,139,201,202],[97,139,201,241],[97,139,201],[97,139,203,218,311],[97,139,310],[97,139,202,203],[97,139,203,308],[97,139,202],[97,139,297],[97,139,154,188,205,217,236,256,262,276,279,296,299],[97,139,250,251,252,253,254,255,277,278,302,357],[97,139,306],[97,139,154,188,205,217,236,242,303,305,307,356,359],[97,139,154,181,188,198,205,207,264],[97,139,261],[97,139,154,188,339,344],[97,139,228,237,264,359],[97,139,327,331,345,348],[97,139,154,211,331,339,340,348],[97,139,197,207,228,239,342],[97,139,154,188,207,214,239,326,327,337,338,341,343],[97,139,189,235,236,237,356,359],[97,139,154,165,181,188,203,205,206,208,211,216,217,225,228,229,231,232,233,234,238,240,264,265,309,323,324,359],[97,139,154,188,205,207,211,325,347],[97,139,154,188,206,208],[85,97,139,154,165,188,196,198,205,206,209,217,234,235,237,238,240,306,356,359],[97,139,154,165,181,188,200,203,204,208],[97,139,201,263],[97,139,154,188,201,206,217],[97,139,154,188,207,218],[97,139,154,188],[97,139,221],[97,139,220],[97,139,222],[97,139,207,219,221,225],[97,139,207,219,221],[97,139,154,188,200,207,208,214,222,223,224],[85,97,139,299,300,301],[97,139,257],[85,97,139,198],[85,97,139,231],[85,97,139,189,234,237,240,356,359],[97,139,198,379,380],[85,97,139,249],[85,97,139,165,181,188,196,243,245,247,248,359],[97,139,208,214,231],[97,139,230],[85,97,139,152,154,165,188,196,249,258,356,357,358],[81,85,86,87,88,97,139,190,191,356,399],[97,139,144],[97,139,328,329,330],[97,139,328],[97,139,368],[97,139,370],[97,139,372],[97,139,565],[97,139,374],[97,139,377],[97,139,381],[89,91,97,139,356,361,365,367,369,371,373,375,378,382,384,390,391,393,400,401,402],[97,139,383],[97,139,389],[97,139,245],[97,139,392],[97,138,139,222,223,224,225,394,395,396,399],[97,139,188],[85,89,97,139,154,156,165,188,190,191,192,194,196,209,348,355,359,399],[97,139,481],[97,139,479,481],[97,139,470,478,479,480,482],[97,139,468],[97,139,471,476,481,484],[97,139,467,484],[97,139,471,472,475,476,477,484],[97,139,471,472,473,475,476,484],[97,139,468,469,470,471,472,476,477,478,480,481,482,484],[97,139,484],[97,139,466,468,469,470,471,472,473,475,476,477,478,479,480,481,482,483],[97,139,466,484],[97,139,471,473,474,476,477,484],[97,139,475,484],[97,139,476,477,481,484],[97,139,469,479],[97,139,516,609,610,611],[85,97,139,516],[85,97,139,522],[97,139,517,518,523],[97,139,525,527,528,529,531],[97,139,516,522],[97,139,526],[97,139,522,525],[97,139,516],[97,139,522],[97,139,530],[97,139,522,524,532],[85,97,139,519],[97,139,519,520,521],[97,139,486,487],[97,139,485,488],[97,106,110,139,181],[97,106,139,170,181],[97,101,139],[97,103,106,139,178,181],[97,139,159,178],[97,101,139,188],[97,103,106,139,159,181],[97,98,99,102,105,139,151,170,181],[97,106,113,139],[97,98,104,139],[97,106,127,128,139],[97,102,106,139,173,181,188],[97,127,139,188],[97,100,101,139,188],[97,106,139],[97,100,101,102,103,104,105,106,107,108,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,128,129,130,131,132,133,139],[97,106,121,139],[97,106,113,114,139],[97,104,106,114,115,139],[97,105,139],[97,98,101,106,139],[97,106,110,114,115,139],[97,110,139],[97,104,106,109,139,181],[97,98,103,106,113,139],[97,139,170],[97,101,106,127,139,186,188],[97,139,535,536],[97,139,535],[97,139,511,537,538,539,541],[97,139,538,539,553,554],[97,139,511,539,553,554],[97,139,511,553,554],[97,139,537,553,556,557,558,559],[97,139,541,553,554],[97,139,538,553],[97,139,537,540],[97,139,537],[97,139,489],[97,139,462],[97,139,400,462],[97,139,378,462]],"fileInfos":[{"version":"69684132aeb9b5642cbcd9e22dff7818ff0ee1aa831728af0ecf97d3364d5546","affectsGlobalScope":true,"impliedFormat":1},{"version":"45b7ab580deca34ae9729e97c13cfd999df04416a79116c3bfb483804f85ded4","impliedFormat":1},{"version":"3facaf05f0c5fc569c5649dd359892c98a85557e3e0c847964caeb67076f4d75","impliedFormat":1},{"version":"e44bb8bbac7f10ecc786703fe0a6a4b952189f908707980ba8f3c8975a760962","impliedFormat":1},{"version":"5e1c4c362065a6b95ff952c0eab010f04dcd2c3494e813b493ecfd4fcb9fc0d8","impliedFormat":1},{"version":"68d73b4a11549f9c0b7d352d10e91e5dca8faa3322bfb77b661839c42b1ddec7","impliedFormat":1},{"version":"5efce4fc3c29ea84e8928f97adec086e3dc876365e0982cc8479a07954a3efd4","impliedFormat":1},{"version":"feecb1be483ed332fad555aff858affd90a48ab19ba7272ee084704eb7167569","impliedFormat":1},{"version":"ee7bad0c15b58988daa84371e0b89d313b762ab83cb5b31b8a2d1162e8eb41c2","impliedFormat":1},{"version":"27bdc30a0e32783366a5abeda841bc22757c1797de8681bbe81fbc735eeb1c10","impliedFormat":1},{"version":"8fd575e12870e9944c7e1d62e1f5a73fcf23dd8d3a321f2a2c74c20d022283fe","impliedFormat":1},{"version":"8bf8b5e44e3c9c36f98e1007e8b7018c0f38d8adc07aecef42f5200114547c70","impliedFormat":1},{"version":"092c2bfe125ce69dbb1223c85d68d4d2397d7d8411867b5cc03cec902c233763","affectsGlobalScope":true,"impliedFormat":1},{"version":"07f073f19d67f74d732b1adea08e1dc66b1b58d77cb5b43931dee3d798a2fd53","affectsGlobalScope":true,"impliedFormat":1},{"version":"c57796738e7f83dbc4b8e65132f11a377649c00dd3eee333f672b8f0a6bea671","affectsGlobalScope":true,"impliedFormat":1},{"version":"dc2df20b1bcdc8c2d34af4926e2c3ab15ffe1160a63e58b7e09833f616efff44","affectsGlobalScope":true,"impliedFormat":1},{"version":"515d0b7b9bea2e31ea4ec968e9edd2c39d3eebf4a2d5cbd04e88639819ae3b71","affectsGlobalScope":true,"impliedFormat":1},{"version":"0559b1f683ac7505ae451f9a96ce4c3c92bdc71411651ca6ddb0e88baaaad6a3","affectsGlobalScope":true,"impliedFormat":1},{"version":"0dc1e7ceda9b8b9b455c3a2d67b0412feab00bd2f66656cd8850e8831b08b537","affectsGlobalScope":true,"impliedFormat":1},{"version":"ce691fb9e5c64efb9547083e4a34091bcbe5bdb41027e310ebba8f7d96a98671","affectsGlobalScope":true,"impliedFormat":1},{"version":"8d697a2a929a5fcb38b7a65594020fcef05ec1630804a33748829c5ff53640d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ff2a353abf8a80ee399af572debb8faab2d33ad38c4b4474cff7f26e7653b8d","affectsGlobalScope":true,"impliedFormat":1},{"version":"936e80ad36a2ee83fc3caf008e7c4c5afe45b3cf3d5c24408f039c1d47bdc1df","affectsGlobalScope":true,"impliedFormat":1},{"version":"d15bea3d62cbbdb9797079416b8ac375ae99162a7fba5de2c6c505446486ac0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"68d18b664c9d32a7336a70235958b8997ebc1c3b8505f4f1ae2b7e7753b87618","affectsGlobalScope":true,"impliedFormat":1},{"version":"eb3d66c8327153d8fa7dd03f9c58d351107fe824c79e9b56b462935176cdf12a","affectsGlobalScope":true,"impliedFormat":1},{"version":"38f0219c9e23c915ef9790ab1d680440d95419ad264816fa15009a8851e79119","affectsGlobalScope":true,"impliedFormat":1},{"version":"69ab18c3b76cd9b1be3d188eaf8bba06112ebbe2f47f6c322b5105a6fbc45a2e","affectsGlobalScope":true,"impliedFormat":1},{"version":"fef8cfad2e2dc5f5b3d97a6f4f2e92848eb1b88e897bb7318cef0e2820bceaab","affectsGlobalScope":true,"impliedFormat":1},{"version":"2f11ff796926e0832f9ae148008138ad583bd181899ab7dd768a2666700b1893","affectsGlobalScope":true,"impliedFormat":1},{"version":"4de680d5bb41c17f7f68e0419412ca23c98d5749dcaaea1896172f06435891fc","affectsGlobalScope":true,"impliedFormat":1},{"version":"954296b30da6d508a104a3a0b5d96b76495c709785c1d11610908e63481ee667","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac9538681b19688c8eae65811b329d3744af679e0bdfa5d842d0e32524c73e1c","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a969edff4bd52585473d24995c5ef223f6652d6ef46193309b3921d65dd4376","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e9fbd7030c440b33d021da145d3232984c8bb7916f277e8ffd3dc2e3eae2bdb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811ec78f7fefcabbda4bfa93b3eb67d9ae166ef95f9bff989d964061cbf81a0c","affectsGlobalScope":true,"impliedFormat":1},{"version":"717937616a17072082152a2ef351cb51f98802fb4b2fdabd32399843875974ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"d7e7d9b7b50e5f22c915b525acc5a49a7a6584cf8f62d0569e557c5cfc4b2ac2","affectsGlobalScope":true,"impliedFormat":1},{"version":"71c37f4c9543f31dfced6c7840e068c5a5aacb7b89111a4364b1d5276b852557","affectsGlobalScope":true,"impliedFormat":1},{"version":"576711e016cf4f1804676043e6a0a5414252560eb57de9faceee34d79798c850","affectsGlobalScope":true,"impliedFormat":1},{"version":"89c1b1281ba7b8a96efc676b11b264de7a8374c5ea1e6617f11880a13fc56dc6","affectsGlobalScope":true,"impliedFormat":1},{"version":"74f7fa2d027d5b33eb0471c8e82a6c87216223181ec31247c357a3e8e2fddc5b","affectsGlobalScope":true,"impliedFormat":1},{"version":"d6d7ae4d1f1f3772e2a3cde568ed08991a8ae34a080ff1151af28b7f798e22ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"063600664504610fe3e99b717a1223f8b1900087fab0b4cad1496a114744f8df","affectsGlobalScope":true,"impliedFormat":1},{"version":"934019d7e3c81950f9a8426d093458b65d5aff2c7c1511233c0fd5b941e608ab","affectsGlobalScope":true,"impliedFormat":1},{"version":"52ada8e0b6e0482b728070b7639ee42e83a9b1c22d205992756fe020fd9f4a47","affectsGlobalScope":true,"impliedFormat":1},{"version":"3bdefe1bfd4d6dee0e26f928f93ccc128f1b64d5d501ff4a8cf3c6371200e5e6","affectsGlobalScope":true,"impliedFormat":1},{"version":"59fb2c069260b4ba00b5643b907ef5d5341b167e7d1dbf58dfd895658bda2867","affectsGlobalScope":true,"impliedFormat":1},{"version":"639e512c0dfc3fad96a84caad71b8834d66329a1f28dc95e3946c9b58176c73a","affectsGlobalScope":true,"impliedFormat":1},{"version":"368af93f74c9c932edd84c58883e736c9e3d53cec1fe24c0b0ff451f529ceab1","affectsGlobalScope":true,"impliedFormat":1},{"version":"af3dd424cf267428f30ccfc376f47a2c0114546b55c44d8c0f1d57d841e28d74","affectsGlobalScope":true,"impliedFormat":1},{"version":"995c005ab91a498455ea8dfb63aa9f83fa2ea793c3d8aa344be4a1678d06d399","affectsGlobalScope":true,"impliedFormat":1},{"version":"959d36cddf5e7d572a65045b876f2956c973a586da58e5d26cde519184fd9b8a","affectsGlobalScope":true,"impliedFormat":1},{"version":"965f36eae237dd74e6cca203a43e9ca801ce38824ead814728a2807b1910117d","affectsGlobalScope":true,"impliedFormat":1},{"version":"3925a6c820dcb1a06506c90b1577db1fdbf7705d65b62b99dce4be75c637e26b","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a3d63ef2b853447ec4f749d3f368ce642264246e02911fcb1590d8c161b8005","affectsGlobalScope":true,"impliedFormat":1},{"version":"b5ce7a470bc3628408429040c4e3a53a27755022a32fd05e2cb694e7015386c7","affectsGlobalScope":true,"impliedFormat":1},{"version":"8444af78980e3b20b49324f4a16ba35024fef3ee069a0eb67616ea6ca821c47a","affectsGlobalScope":true,"impliedFormat":1},{"version":"3287d9d085fbd618c3971944b65b4be57859f5415f495b33a6adc994edd2f004","affectsGlobalScope":true,"impliedFormat":1},{"version":"b4b67b1a91182421f5df999988c690f14d813b9850b40acd06ed44691f6727ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"df83c2a6c73228b625b0beb6669c7ee2a09c914637e2d35170723ad49c0f5cd4","affectsGlobalScope":true,"impliedFormat":1},{"version":"436aaf437562f276ec2ddbee2f2cdedac7664c1e4c1d2c36839ddd582eeb3d0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e3c06ea092138bf9fa5e874a1fdbc9d54805d074bee1de31b99a11e2fec239d","affectsGlobalScope":true,"impliedFormat":1},{"version":"87dc0f382502f5bbce5129bdc0aea21e19a3abbc19259e0b43ae038a9fc4e326","affectsGlobalScope":true,"impliedFormat":1},{"version":"b1cb28af0c891c8c96b2d6b7be76bd394fddcfdb4709a20ba05a7c1605eea0f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2fef54945a13095fdb9b84f705f2b5994597640c46afeb2ce78352fab4cb3279","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac77cb3e8c6d3565793eb90a8373ee8033146315a3dbead3bde8db5eaf5e5ec6","affectsGlobalScope":true,"impliedFormat":1},{"version":"56e4ed5aab5f5920980066a9409bfaf53e6d21d3f8d020c17e4de584d29600ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ece9f17b3866cc077099c73f4983bddbcb1dc7ddb943227f1ec070f529dedd1","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a6282c8827e4b9a95f4bf4f5c205673ada31b982f50572d27103df8ceb8013c","affectsGlobalScope":true,"impliedFormat":1},{"version":"1c9319a09485199c1f7b0498f2988d6d2249793ef67edda49d1e584746be9032","affectsGlobalScope":true,"impliedFormat":1},{"version":"e3a2a0cee0f03ffdde24d89660eba2685bfbdeae955a6c67e8c4c9fd28928eeb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811c71eee4aa0ac5f7adf713323a5c41b0cf6c4e17367a34fbce379e12bbf0a4","affectsGlobalScope":true,"impliedFormat":1},{"version":"51ad4c928303041605b4d7ae32e0c1ee387d43a24cd6f1ebf4a2699e1076d4fa","affectsGlobalScope":true,"impliedFormat":1},{"version":"60037901da1a425516449b9a20073aa03386cce92f7a1fd902d7602be3a7c2e9","affectsGlobalScope":true,"impliedFormat":1},{"version":"d4b1d2c51d058fc21ec2629fff7a76249dec2e36e12960ea056e3ef89174080f","affectsGlobalScope":true,"impliedFormat":1},{"version":"22adec94ef7047a6c9d1af3cb96be87a335908bf9ef386ae9fd50eeb37f44c47","affectsGlobalScope":true,"impliedFormat":1},{"version":"4245fee526a7d1754529d19227ecbf3be066ff79ebb6a380d78e41648f2f224d","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e7f8264d0fb4c5339605a15daadb037bf238c10b654bb3eee14208f860a32ea","affectsGlobalScope":true,"impliedFormat":1},{"version":"782dec38049b92d4e85c1585fbea5474a219c6984a35b004963b00beb1aab538","affectsGlobalScope":true,"impliedFormat":1},{"version":"0990a7576222f248f0a3b888adcb7389f957928ce2afb1cd5128169086ff4d29","impliedFormat":1},{"version":"36a2e4c9a67439aca5f91bb304611d5ae6e20d420503e96c230cf8fcdc948d94","affectsGlobalScope":true,"impliedFormat":1},{"version":"8a8eb4ebffd85e589a1cc7c178e291626c359543403d58c9cd22b81fab5b1fb9","impliedFormat":1},{"version":"65ff5a0aefd7817a03c1ad04fee85c9cdd3ec415cc3c9efec85d8008d4d5e4ee","impliedFormat":1},{"version":"b2546f0fbeae6ef5e232c04100e1d8c49d36d1fff8e4755f663a3e3f06e7f2d6","affectsGlobalScope":true,"impliedFormat":1},{"version":"cc69795d9954ee4ad57545b10c7bf1a7260d990231b1685c147ea71a6faa265c","impliedFormat":1},{"version":"8bc6c94ff4f2af1f4023b7bb2379b08d3d7dd80c698c9f0b07431ea16101f05f","impliedFormat":1},{"version":"1b61d259de5350f8b1e5db06290d31eaebebc6baafd5f79d314b5af9256d7153","impliedFormat":1},{"version":"57194e1f007f3f2cbef26fa299d4c6b21f4623a2eddc63dfeef79e38e187a36e","impliedFormat":1},{"version":"0f6666b58e9276ac3a38fdc80993d19208442d6027ab885580d93aec76b4ef00","impliedFormat":1},{"version":"05fd364b8ef02fb1e174fbac8b825bdb1e5a36a016997c8e421f5fab0a6da0a0","impliedFormat":1},{"version":"70521b6ab0dcba37539e5303104f29b721bfb2940b2776da4cc818c07e1fefc1","affectsGlobalScope":true,"impliedFormat":1},{"version":"ab41ef1f2cdafb8df48be20cd969d875602483859dc194e9c97c8a576892c052","affectsGlobalScope":true,"impliedFormat":1},{"version":"d153a11543fd884b596587ccd97aebbeed950b26933ee000f94009f1ab142848","affectsGlobalScope":true,"impliedFormat":1},{"version":"21d819c173c0cf7cc3ce57c3276e77fd9a8a01d35a06ad87158781515c9a438a","impliedFormat":1},{"version":"a79e62f1e20467e11a904399b8b18b18c0c6eea6b50c1168bf215356d5bebfaf","affectsGlobalScope":true,"impliedFormat":1},{"version":"6b80c6175da9de59bace50a72c2d68490d4ab5b07016ff5367bc7ba33cf2f219","affectsGlobalScope":true,"impliedFormat":1},{"version":"5929864ce17fba74232584d90cb721a89b7ad277220627cc97054ba15a98ea8f","impliedFormat":1},{"version":"24bd580b5743dc56402c440dc7f9a4f5d592ad7a419f25414d37a7bfe11e342b","impliedFormat":1},{"version":"25c8056edf4314820382a5fdb4bb7816999acdcb929c8f75e3f39473b87e85bc","impliedFormat":1},{"version":"c464d66b20788266e5353b48dc4aa6bc0dc4a707276df1e7152ab0c9ae21fad8","impliedFormat":1},{"version":"78d0d27c130d35c60b5e5566c9f1e5be77caf39804636bc1a40133919a949f21","impliedFormat":1},{"version":"c6fd2c5a395f2432786c9cb8deb870b9b0e8ff7e22c029954fabdd692bff6195","impliedFormat":1},{"version":"1d6e127068ea8e104a912e42fc0a110e2aa5a66a356a917a163e8cf9a65e4a75","impliedFormat":1},{"version":"5ded6427296cdf3b9542de4471d2aa8d3983671d4cac0f4bf9c637208d1ced43","impliedFormat":1},{"version":"6bdc71028db658243775263e93a7db2fd2abfce3ca569c3cca5aee6ed5eb186d","impliedFormat":1},{"version":"cadc8aced301244057c4e7e73fbcae534b0f5b12a37b150d80e5a45aa4bebcbd","impliedFormat":1},{"version":"385aab901643aa54e1c36f5ef3107913b10d1b5bb8cbcd933d4263b80a0d7f20","impliedFormat":1},{"version":"9670d44354bab9d9982eca21945686b5c24a3f893db73c0dae0fd74217a4c219","impliedFormat":1},{"version":"0b8a9268adaf4da35e7fa830c8981cfa22adbbe5b3f6f5ab91f6658899e657a7","impliedFormat":1},{"version":"11396ed8a44c02ab9798b7dca436009f866e8dae3c9c25e8c1fbc396880bf1bb","impliedFormat":1},{"version":"ba7bc87d01492633cb5a0e5da8a4a42a1c86270e7b3d2dea5d156828a84e4882","impliedFormat":1},{"version":"4893a895ea92c85345017a04ed427cbd6a1710453338df26881a6019432febdd","impliedFormat":1},{"version":"c21dc52e277bcfc75fac0436ccb75c204f9e1b3fa5e12729670910639f27343e","impliedFormat":1},{"version":"13f6f39e12b1518c6650bbb220c8985999020fe0f21d818e28f512b7771d00f9","impliedFormat":1},{"version":"9b5369969f6e7175740bf51223112ff209f94ba43ecd3bb09eefff9fd675624a","impliedFormat":1},{"version":"4fe9e626e7164748e8769bbf74b538e09607f07ed17c2f20af8d680ee49fc1da","impliedFormat":1},{"version":"24515859bc0b836719105bb6cc3d68255042a9f02a6022b3187948b204946bd2","impliedFormat":1},{"version":"ea0148f897b45a76544ae179784c95af1bd6721b8610af9ffa467a518a086a43","impliedFormat":1},{"version":"24c6a117721e606c9984335f71711877293a9651e44f59f3d21c1ea0856f9cc9","impliedFormat":1},{"version":"dd3273ead9fbde62a72949c97dbec2247ea08e0c6952e701a483d74ef92d6a17","impliedFormat":1},{"version":"405822be75ad3e4d162e07439bac80c6bcc6dbae1929e179cf467ec0b9ee4e2e","impliedFormat":1},{"version":"0db18c6e78ea846316c012478888f33c11ffadab9efd1cc8bcc12daded7a60b6","impliedFormat":1},{"version":"4d2b0eb911816f66abe4970898f97a2cfc902bcd743cbfa5017fad79f7ef90d8","impliedFormat":1},{"version":"bd0532fd6556073727d28da0edfd1736417a3f9f394877b6d5ef6ad88fba1d1a","impliedFormat":1},{"version":"89167d696a849fce5ca508032aabfe901c0868f833a8625d5a9c6e861ef935d2","impliedFormat":1},{"version":"e53a3c2a9f624d90f24bf4588aacd223e7bec1b9d0d479b68d2f4a9e6011147f","impliedFormat":1},{"version":"24b8685c62562f5d98615c5a0c1d05f297cf5065f15246edfe99e81ec4c0e011","impliedFormat":1},{"version":"93507c745e8f29090efb99399c3f77bec07db17acd75634249dc92f961573387","impliedFormat":1},{"version":"339dc5265ee5ed92e536a93a04c4ebbc2128f45eeec6ed29f379e0085283542c","impliedFormat":1},{"version":"4732aec92b20fb28c5fe9ad99521fb59974289ed1e45aecb282616202184064f","impliedFormat":1},{"version":"2e85db9e6fd73cfa3d7f28e0ab6b55417ea18931423bd47b409a96e4a169e8e6","impliedFormat":1},{"version":"c46e079fe54c76f95c67fb89081b3e399da2c7d109e7dca8e4b58d83e332e605","impliedFormat":1},{"version":"bf67d53d168abc1298888693338cb82854bdb2e69ef83f8a0092093c2d562107","impliedFormat":1},{"version":"08faa97886e71757779428dd4c69a545c32c85fd629d1116d42710b32c6378bc","affectsGlobalScope":true,"impliedFormat":1},{"version":"6b042aa5d277ad6963e2837179fd2f8fbb01968ac67115b0833c0244e93d1d50","impliedFormat":1},{"version":"7394959e5a741b185456e1ef5d64599c36c60a323207450991e7a42e08911419","impliedFormat":1},{"version":"3d77c73be94570813f8cadd1f05ebc3dc5e2e4fdefe4d340ca20cd018724ee36","impliedFormat":1},{"version":"23cfd70b42094e54cc3c5dab996d81b97e2b6f38ccb24ead85454b8ddfe2fc4f","affectsGlobalScope":true,"impliedFormat":1},{"version":"f3e58c4c18a031cbb17abec7a4ad0bd5ae9fc70c1f4ba1e7fb921ad87c504aca","impliedFormat":1},{"version":"a3e8bafb2af8e850c644f4be7f5156cf7d23b7bfdc3b786bd4d10ed40329649c","impliedFormat":1},{"version":"35ec8b6760fd7138bbf5809b84551e31028fb2ba7b6dc91d95d098bf212ca8b4","affectsGlobalScope":true,"impliedFormat":1},{"version":"5524481e56c48ff486f42926778c0a3cce1cc85dc46683b92b1271865bcf015a","impliedFormat":1},{"version":"4b87f767c7bc841511113c876a6b8bf1fd0cb0b718c888ad84478b372ec486b1","affectsGlobalScope":true,"impliedFormat":1},{"version":"8d04e3640dd9eb67f7f1e5bd3d0bf96c784666f7aefc8ac1537af6f2d38d4c29","impliedFormat":1},{"version":"3c884d9d9ec454bdf0d5a0b8465bf8297d2caa4d853851d92cc417ac6f30b969","impliedFormat":1},{"version":"5a369483ac4cfbdf0331c248deeb36140e6907db5e1daed241546b4a2055f82c","impliedFormat":1},{"version":"e8f5b5cc36615c17d330eaf8eebbc0d6bdd942c25991f96ef122f246f4ff722f","impliedFormat":1},{"version":"f0bd7e6d931657b59605c44112eaf8b980ba7f957a5051ed21cb93d978cf2f45","impliedFormat":1},{"version":"ee1ee365d88c4c6c0c0a5a5701d66ebc27ccd0bcfcfaa482c6e2e7fe7b98edf7","affectsGlobalScope":true,"impliedFormat":1},{"version":"0ada07543808f3b967624645a8e1ccd446f8b01ade47842acf1328aec899fed0","affectsGlobalScope":true,"impliedFormat":1},{"version":"b79ca740194c9e90bd6657046411c940d0c79dcc35392a15b02be5ba9ac55eb0","impliedFormat":1},{"version":"71adf5dbc59568663d252a46179e71e4d544c053978bfc526d11543a3f716f42","impliedFormat":1},{"version":"38bf8ff1b403c861e9052c9ea651cb4f38c1ecc084a34d79f8acc6d6477a7321","impliedFormat":1},{"version":"93bd413918fa921c8729cef45302b24d8b6c7855d72d5bf82d3972595ae8dcbf","impliedFormat":1},{"version":"4ff41188773cbf465807dd2f7059c7494cbee5115608efc297383832a1150c43","impliedFormat":1},{"version":"dccdf1677e531e33f8ac961a68bc537418c9a414797c1ea7e91307501cdc3f5e","impliedFormat":1},{"version":"e184c4b8918ef56c8c9e68bd79f3f3780e2d0d75bf2b8a41da1509a40c2deb46","affectsGlobalScope":true,"impliedFormat":1},{"version":"d206b4baf4ddcc15d9d69a9a2f4999a72a2c6adeaa8af20fa7a9960816287555","impliedFormat":1},{"version":"93f437e1398a4f06a984f441f7fa7a9f0535c04399619b5c22e0b87bdee182cb","impliedFormat":1},{"version":"afbe24ab0d74694372baa632ecb28bb375be53f3be53f9b07ecd7fc994907de5","impliedFormat":1},{"version":"70731d10d5311bd4cf710ef7f6539b62660f4b0bfdbb3f9fbe1d25fe6366a7fa","affectsGlobalScope":true,"impliedFormat":1},{"version":"6b19db3600a17af69d4f33d08cc7076a7d19fb65bb36e442cac58929ec7c9482","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e043a1bc8fbf2a255bccf9bf27e0f1caf916c3b0518ea34aa72357c0afd42ec","impliedFormat":1},{"version":"137c2894e8f3e9672d401cc0a305dc7b1db7c69511cf6d3970fb53302f9eae09","impliedFormat":1},{"version":"3bc2f1e2c95c04048212c569ed38e338873f6a8593930cf5a7ef24ffb38fc3b6","impliedFormat":1},{"version":"8145e07aad6da5f23f2fcd8c8e4c5c13fb26ee986a79d03b0829b8fce152d8b2","impliedFormat":1},{"version":"f9d9d753d430ed050dc1bf2667a1bab711ccbb1c1507183d794cc195a5b085cc","impliedFormat":1},{"version":"9eece5e586312581ccd106d4853e861aaaa1a39f8e3ea672b8c3847eedd12f6e","impliedFormat":1},{"version":"ba1f814c22fd970255ddd60d61fb7e00c28271c933ab5d5cc19cd3ca66b8f57c","impliedFormat":1},{"version":"37ba7b45141a45ce6e80e66f2a96c8a5ab1bcef0fc2d0f56bb58df96ec67e972","impliedFormat":1},{"version":"125d792ec6c0c0f657d758055c494301cc5fdb327d9d9d5960b3f129aff76093","impliedFormat":1},{"version":"295f068af94245ee9d780555351bef98adfd58f8baf0b9dadbc31a489b881f8b","affectsGlobalScope":true,"impliedFormat":1},{"version":"1851a3b4db78664f83901bb9cac9e45e03a37bb5933cc5bf37e10bb7e91ab4eb","impliedFormat":1},{"version":"09d479208911ac3ac6a7c2fe86217fc1abe6c4f04e2d52e4890e500699eeab32","affectsGlobalScope":true,"impliedFormat":1},{"version":"27d8987fd22d92efe6560cf0ce11767bf089903ffe26047727debfd1f3bf438b","affectsGlobalScope":true,"impliedFormat":1},{"version":"578d8bb6dcb2a1c03c4c3f8eb71abc9677e1a5c788b7f24848e3138ce17f3400","impliedFormat":1},{"version":"4f029899f9bae07e225c43aef893590541b2b43267383bf5e32e3a884d219ed5","impliedFormat":1},{"version":"ae56f65caf3be91108707bd8dfbccc2a57a91feb5daabf7165a06a945545ed26","impliedFormat":1},{"version":"a136d5de521da20f31631a0a96bf712370779d1c05b7015d7019a9b2a0446ca9","impliedFormat":1},{"version":"5b566927cad2ed2139655d55d690ffa87df378b956e7fe1c96024c4d9f75c4cf","affectsGlobalScope":true,"impliedFormat":1},{"version":"bce947017cb7a2deebcc4f5ba04cead891ce6ad1602a4438ae45ed9aa1f39104","affectsGlobalScope":true,"impliedFormat":1},{"version":"d3dffd70e6375b872f0b4e152de4ae682d762c61a24881ecc5eb9f04c5caf76f","impliedFormat":1},{"version":"e2c72c065a36bc9ab2a00ac6a6f51e71501619a72c0609defd304d46610487a4","impliedFormat":1},{"version":"d91a7d8b5655c42986f1bdfe2105c4408f472831c8f20cf11a8c3345b6b56c8c","impliedFormat":1},{"version":"616075a6ac578cf5a013ee12964188b4412823796ce0b202c6f1d2e4ca8480d7","affectsGlobalScope":true,"impliedFormat":1},{"version":"e8a979b8af001c9fc2e774e7809d233c8ca955a28756f52ee5dee88ccb0611d2","impliedFormat":1},{"version":"cac793cc47c29e26e4ac3601dcb00b4435ebed26203485790e44f2ad8b6ad847","impliedFormat":1},{"version":"8caa5c86be1b793cd5f599e27ecb34252c41e011980f7d61ae4989a149ff6ccc","impliedFormat":1},{"version":"3609e455ffcba8176c8ce0aa57f8258fe10cf03987e27f1fab68f702b4426521","impliedFormat":1},{"version":"d1bd4e51810d159899aad1660ccb859da54e27e08b8c9862b40cd36c1d9ff00f","impliedFormat":1},{"version":"17ed71200119e86ccef2d96b73b02ce8854b76ad6bd21b5021d4269bec527b5f","impliedFormat":1},{"version":"5dbf2a502a7fcd85bfe753b585cfc6c9f60294570ee6a18084e574cf93be3fa0","impliedFormat":1},{"version":"bb7a61dd55dc4b9422d13da3a6bb9cc5e89be888ef23bbcf6558aa9726b89a1c","impliedFormat":1},{"version":"db6d2d9daad8a6d83f281af12ce4355a20b9a3e71b82b9f57cddcca0a8964a96","impliedFormat":1},{"version":"cfe4ef4710c3786b6e23dae7c086c70b4f4835a2e4d77b75d39f9046106e83d3","impliedFormat":1},{"version":"cbea99888785d49bb630dcbb1613c73727f2b5a2cf02e1abcaab7bcf8d6bf3c5","impliedFormat":1},{"version":"3a8bddb66b659f6bd2ff641fc71df8a8165bafe0f4b799cc298be5cd3755bb20","impliedFormat":1},{"version":"a86f82d646a739041d6702101afa82dcb935c416dd93cbca7fd754fd0282ce1f","impliedFormat":1},{"version":"2dad084c67e649f0f354739ec7df7c7df0779a28a4f55c97c6b6883ae850d1ce","impliedFormat":1},{"version":"fa5bbc7ab4130dd8cdc55ea294ec39f76f2bc507a0f75f4f873e38631a836ca7","impliedFormat":1},{"version":"df45ca1176e6ac211eae7ddf51336dc075c5314bc5c253651bae639defd5eec5","impliedFormat":1},{"version":"cf86de1054b843e484a3c9300d62fbc8c97e77f168bbffb131d560ca0474d4a8","impliedFormat":1},{"version":"196c960b12253fde69b204aa4fbf69470b26daf7a430855d7f94107a16495ab0","impliedFormat":1},{"version":"ee15ea5dd7a9fc9f5013832e5843031817a880bf0f24f37a29fd8337981aae07","impliedFormat":1},{"version":"bf24f6d35f7318e246010ffe9924395893c4e96d34324cde77151a73f078b9ad","impliedFormat":1},{"version":"805c5db07d4b131bede36cc2dbded64cc3c8e49594e53119f4442af183f97935","impliedFormat":1},{"version":"10595c7ff5094dd5b6a959ccb1c00e6a06441b4e10a87bc09c15f23755d34439","impliedFormat":1},{"version":"9620c1ff645afb4a9ab4044c85c26676f0a93e8c0e4b593aea03a89ccb47b6d0","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"a9af0e608929aaf9ce96bd7a7b99c9360636c31d73670e4af09a09950df97841","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"c86fe861cf1b4c46a0fb7d74dffe596cf679a2e5e8b1456881313170f092e3fa","impliedFormat":1},{"version":"08ed0b3f0166787f84a6606f80aa3b1388c7518d78912571b203817406e471da","impliedFormat":1},{"version":"47e5af2a841356a961f815e7c55d72554db0c11b4cba4d0caab91f8717846a94","impliedFormat":1},{"version":"65f43099ded6073336e697512d9b80f2d4fec3182b7b2316abf712e84104db00","impliedFormat":1},{"version":"f5f541902bf7ae0512a177295de9b6bcd6809ea38307a2c0a18bfca72212f368","impliedFormat":1},{"version":"b0decf4b6da3ebc52ea0c96095bdfaa8503acc4ac8e9081c5f2b0824835dd3bd","impliedFormat":1},{"version":"ca1b882a105a1972f82cc58e3be491e7d750a1eb074ffd13b198269f57ed9e1b","impliedFormat":1},{"version":"fc3e1c87b39e5ba1142f27ec089d1966da168c04a859a4f6aab64dceae162c2b","impliedFormat":1},{"version":"3b414b99a73171e1c4b7b7714e26b87d6c5cb03d200352da5342ab4088a54c85","impliedFormat":1},{"version":"61888522cec948102eba94d831c873200aa97d00d8989fdfd2a3e0ee75ec65a2","impliedFormat":1},{"version":"4e10622f89fea7b05dd9b52fb65e1e2b5cbd96d4cca3d9e1a60bb7f8a9cb86a1","impliedFormat":1},{"version":"74b2a5e5197bd0f2e0077a1ea7c07455bbea67b87b0869d9786d55104006784f","impliedFormat":1},{"version":"59bf32919de37809e101acffc120596a9e45fdbab1a99de5087f31fdc36e2f11","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"3c4b45e48c56c17fb44b3cab4e2a6c8f64c4fa2c0306fe27d33c52167c0b7fa7","impliedFormat":1},{"version":"c40c848daad198266370c1c72a7a8c3d18d2f50727c7859fcfefd3ff69a7f288","impliedFormat":1},{"version":"ac60bbee0d4235643cc52b57768b22de8c257c12bd8c2039860540cab1fa1d82","impliedFormat":1},{"version":"6428e6edd944ce6789afdf43f9376c1f2e4957eea34166177625aaff4c0da1a0","impliedFormat":1},{"version":"ada39cbb2748ab2873b7835c90c8d4620723aedf323550e8489f08220e477c7f","impliedFormat":1},{"version":"6e5f5cee603d67ee1ba6120815497909b73399842254fc1e77a0d5cdc51d8c9c","impliedFormat":1},{"version":"8dba67056cbb27628e9b9a1cba8e57036d359dceded0725c72a3abe4b6c79cd4","impliedFormat":1},{"version":"70f3814c457f54a7efe2d9ce9d2686de9250bb42eb7f4c539bd2280a42e52d33","impliedFormat":1},{"version":"154dd2e22e1e94d5bc4ff7726706bc0483760bae40506bdce780734f11f7ec47","impliedFormat":1},{"version":"ef61792acbfa8c27c9bd113f02731e66229f7d3a169e3c1993b508134f1a58e0","impliedFormat":1},{"version":"9c82171d836c47486074e4ca8e059735bf97b205e70b196535b5efd40cbe1bc5","impliedFormat":1},{"version":"0131e203d8560edb39678abe10db42564a068f98c4ebd1ed9ffe7279c78b3c81","impliedFormat":1},{"version":"f6404e7837b96da3ea4d38c4f1a3812c96c9dcdf264e93d5bdb199f983a3ef4b","impliedFormat":1},{"version":"c5426dbfc1cf90532f66965a7aa8c1136a78d4d0f96d8180ecbfc11d7722f1a5","impliedFormat":1},{"version":"65a15fc47900787c0bd18b603afb98d33ede930bed1798fc984d5ebb78b26cf9","impliedFormat":1},{"version":"9d202701f6e0744adb6314d03d2eb8fc994798fc83d91b691b75b07626a69801","impliedFormat":1},{"version":"de9d2df7663e64e3a91bf495f315a7577e23ba088f2949d5ce9ec96f44fba37d","impliedFormat":1},{"version":"c7af78a2ea7cb1cd009cfb5bdb48cd0b03dad3b54f6da7aab615c2e9e9d570c5","impliedFormat":1},{"version":"1ee45496b5f8bdee6f7abc233355898e5bf9bd51255db65f5ff7ede617ca0027","impliedFormat":1},{"version":"8b8f00491431fe82f060dfe8c7f2180a9fb239f3d851527db909b83230e75882","affectsGlobalScope":true,"impliedFormat":1},{"version":"db01d18853469bcb5601b9fc9826931cc84cc1a1944b33cad76fd6f1e3d8c544","affectsGlobalScope":true,"impliedFormat":1},{"version":"dba114fb6a32b355a9cfc26ca2276834d72fe0e94cd2c3494005547025015369","impliedFormat":1},{"version":"903e299a28282fa7b714586e28409ed73c3b63f5365519776bf78e8cf173db36","affectsGlobalScope":true,"impliedFormat":1},{"version":"fa6c12a7c0f6b84d512f200690bfc74819e99efae69e4c95c4cd30f6884c526e","impliedFormat":1},{"version":"f1c32f9ce9c497da4dc215c3bc84b722ea02497d35f9134db3bb40a8d918b92b","impliedFormat":1},{"version":"b73c319af2cc3ef8f6421308a250f328836531ea3761823b4cabbd133047aefa","affectsGlobalScope":true,"impliedFormat":1},{"version":"e433b0337b8106909e7953015e8fa3f2d30797cea27141d1c5b135365bb975a6","impliedFormat":1},{"version":"dd3900b24a6a8745efeb7ad27629c0f8a626470ac229c1d73f1fe29d67e44dca","impliedFormat":1},{"version":"ddff7fc6edbdc5163a09e22bf8df7bef75f75369ebd7ecea95ba55c4386e2441","impliedFormat":1},{"version":"106c6025f1d99fd468fd8bf6e5bda724e11e5905a4076c5d29790b6c3745e50c","impliedFormat":1},{"version":"ec29be0737d39268696edcec4f5e97ce26f449fa9b7afc2f0f99a86def34a418","impliedFormat":1},{"version":"aeab39e8e0b1a3b250434c3b2bb8f4d17bbec2a9dbce5f77e8a83569d3d2cbc2","impliedFormat":1},{"version":"ec6cba1c02c675e4dd173251b156792e8d3b0c816af6d6ad93f1a55d674591aa","impliedFormat":1},{"version":"b620391fe8060cf9bedc176a4d01366e6574d7a71e0ac0ab344a4e76576fcbb8","impliedFormat":1},{"version":"d729408dfde75b451530bcae944cf89ee8277e2a9df04d1f62f2abfd8b03c1e1","impliedFormat":1},{"version":"e15d3c84d5077bb4a3adee4c791022967b764dc41cb8fa3cfa44d4379b2c95f5","impliedFormat":1},{"version":"5f58e28cd22e8fc1ac1b3bc6b431869f1e7d0b39e2c21fbf79b9fa5195a85980","impliedFormat":1},{"version":"e1fc1a1045db5aa09366be2b330e4ce391550041fc3e925f60998ca0b647aa97","impliedFormat":1},{"version":"63533978dcda286422670f6e184ac516805a365fb37a086eeff4309e812f1402","impliedFormat":1},{"version":"43ba4f2fa8c698f5c304d21a3ef596741e8e85a810b7c1f9b692653791d8d97a","impliedFormat":1},{"version":"31fb49ef3aa3d76f0beb644984e01eab0ea222372ea9b49bb6533be5722d756c","impliedFormat":1},{"version":"33cd131e1461157e3e06b06916b5176e7a8ec3fce15a5cfe145e56de744e07d2","impliedFormat":1},{"version":"889ef863f90f4917221703781d9723278db4122d75596b01c429f7c363562b86","impliedFormat":1},{"version":"3556cfbab7b43da96d15a442ddbb970e1f2fc97876d055b6555d86d7ac57dae5","impliedFormat":1},{"version":"437751e0352c6e924ddf30e90849f1d9eb00ca78c94d58d6a37202ec84eb8393","impliedFormat":1},{"version":"48e8af7fdb2677a44522fd185d8c87deff4d36ee701ea003c6c780b1407a1397","impliedFormat":1},{"version":"d11308de5a36c7015bb73adb5ad1c1bdaac2baede4cc831a05cf85efa3cc7f2f","impliedFormat":1},{"version":"38e4684c22ed9319beda6765bab332c724103d3a966c2e5e1c5a49cf7007845f","impliedFormat":1},{"version":"f9812cfc220ecf7557183379531fa409acd249b9e5b9a145d0d52b76c20862de","affectsGlobalScope":true,"impliedFormat":1},{"version":"e650298721abc4f6ae851e60ae93ee8199791ceec4b544c3379862f81f43178c","impliedFormat":1},{"version":"2e4f37ffe8862b14d8e24ae8763daaa8340c0df0b859d9a9733def0eee7562d9","impliedFormat":1},{"version":"13283350547389802aa35d9f2188effaeac805499169a06ef5cd77ce2a0bd63f","impliedFormat":1},{"version":"680793958f6a70a44c8d9ae7d46b7a385361c69ac29dcab3ed761edce1c14ab8","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"42c169fb8c2d42f4f668c624a9a11e719d5d07dacbebb63cbcf7ef365b0a75b3","impliedFormat":1},{"version":"913ddbba170240070bd5921b8f33ea780021bdf42fbdfcd4fcb2691b1884ddde","impliedFormat":1},{"version":"b4e6d416466999ff40d3fe5ceb95f7a8bfb7ac2262580287ac1a8391e5362431","impliedFormat":1},{"version":"5fe23bd829e6be57d41929ac374ee9551ccc3c44cee893167b7b5b77be708014","impliedFormat":1},{"version":"0a626484617019fcfbfc3c1bc1f9e84e2913f1adb73692aa9075817404fb41a1","impliedFormat":1},{"version":"438c7513b1df91dcef49b13cd7a1c4720f91a36e88c1df731661608b7c055f10","impliedFormat":1},{"version":"cf185cc4a9a6d397f416dd28cca95c227b29f0f27b160060a95c0e5e36cda865","impliedFormat":1},{"version":"0086f3e4ad898fd7ca56bb223098acfacf3fa065595182aaf0f6c4a6a95e6fbd","impliedFormat":1},{"version":"efaa078e392f9abda3ee8ade3f3762ab77f9c50b184e6883063a911742a4c96a","impliedFormat":1},{"version":"54a8bb487e1dc04591a280e7a673cdfb272c83f61e28d8a64cf1ac2e63c35c51","impliedFormat":1},{"version":"021a9498000497497fd693dd315325484c58a71b5929e2bbb91f419b04b24cea","impliedFormat":1},{"version":"9385cdc09850950bc9b59cca445a3ceb6fcca32b54e7b626e746912e489e535e","impliedFormat":1},{"version":"2894c56cad581928bb37607810af011764a2f511f575d28c9f4af0f2ef02d1ab","impliedFormat":1},{"version":"0a72186f94215d020cb386f7dca81d7495ab6c17066eb07d0f44a5bf33c1b21a","impliedFormat":1},{"version":"84124384abae2f6f66b7fbfc03862d0c2c0b71b826f7dbf42c8085d31f1d3f95","impliedFormat":1},{"version":"63a8e96f65a22604eae82737e409d1536e69a467bb738bec505f4f97cce9d878","impliedFormat":1},{"version":"3fd78152a7031315478f159c6a5872c712ece6f01212c78ea82aef21cb0726e2","impliedFormat":1},{"version":"b01bd582a6e41457bc56e6f0f9de4cb17f33f5f3843a7cf8210ac9c18472fb0f","impliedFormat":1},{"version":"58b49e5c1def740360b5ae22ae2405cfac295fee74abd88d74ac4ea42502dc03","impliedFormat":1},{"version":"512fc15cca3a35b8dbbf6e23fe9d07e6f87ad03c895acffd3087ce09f352aad0","impliedFormat":1},{"version":"9a0946d15a005832e432ea0cd4da71b57797efb25b755cc07f32274296d62355","impliedFormat":1},{"version":"a52ff6c0a149e9f370372fc3c715d7f2beee1f3bab7980e271a7ab7d313ec677","impliedFormat":1},{"version":"fd933f824347f9edd919618a76cdb6a0c0085c538115d9a287fa0c7f59957ab3","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"6a1aa3e55bdc50503956c5cd09ae4cd72e3072692d742816f65c66ca14f4dfdd","impliedFormat":1},{"version":"ab75cfd9c4f93ffd601f7ca1753d6a9d953bbedfbd7a5b3f0436ac8a1de60dfa","impliedFormat":1},{"version":"f95180f03d827525ca4f990f49e17ec67198c316dd000afbe564655141f725cd","impliedFormat":1},{"version":"b73cbf0a72c8800cf8f96a9acfe94f3ad32ca71342a8908b8ae484d61113f647","impliedFormat":1},{"version":"bae6dd176832f6423966647382c0d7ba9e63f8c167522f09a982f086cd4e8b23","impliedFormat":1},{"version":"1364f64d2fb03bbb514edc42224abd576c064f89be6a990136774ecdd881a1da","impliedFormat":1},{"version":"c9958eb32126a3843deedda8c22fb97024aa5d6dd588b90af2d7f2bfac540f23","impliedFormat":1},{"version":"950fb67a59be4c2dbe69a5786292e60a5cb0e8612e0e223537784c731af55db1","impliedFormat":1},{"version":"e927c2c13c4eaf0a7f17e6022eee8519eb29ef42c4c13a31e81a611ab8c95577","impliedFormat":1},{"version":"07ca44e8d8288e69afdec7a31fa408ce6ab90d4f3d620006701d5544646da6aa","impliedFormat":1},{"version":"70246ad95ad8a22bdfe806cb5d383a26c0c6e58e7207ab9c431f1cb175aca657","impliedFormat":1},{"version":"f00f3aa5d64ff46e600648b55a79dcd1333458f7a10da2ed594d9f0a44b76d0b","impliedFormat":1},{"version":"772d8d5eb158b6c92412c03228bd9902ccb1457d7a705b8129814a5d1a6308fc","impliedFormat":1},{"version":"4e4475fba4ed93a72f167b061cd94a2e171b82695c56de9899275e880e06ba41","impliedFormat":1},{"version":"97c5f5d580ab2e4decd0a3135204050f9b97cd7908c5a8fbc041eadede79b2fa","impliedFormat":1},{"version":"c99a3a5f2215d5b9d735aa04cec6e61ed079d8c0263248e298ffe4604d4d0624","impliedFormat":1},{"version":"49b2375c586882c3ac7f57eba86680ff9742a8d8cb2fe25fe54d1b9673690d41","impliedFormat":1},{"version":"802e797bcab5663b2c9f63f51bdf67eff7c41bc64c0fd65e6da3e7941359e2f7","impliedFormat":1},{"version":"847e160d709c74cc714fbe1f99c41d3425b74cd47b1be133df1623cd87014089","impliedFormat":1},{"version":"3ecfccf916fea7c6c34394413b55eb70e817a73e39b4417d6573e523784e3f8e","impliedFormat":1},{"version":"5cdc27fbc5c166fc5c763a30ac21cbac9859dc5ba795d3230db6d4e52a1965bb","impliedFormat":1},{"version":"6459054aabb306821a043e02b89d54da508e3a6966601a41e71c166e4ea1474f","impliedFormat":1},{"version":"f416c9c3eee9d47ff49132c34f96b9180e50485d435d5748f0e8b72521d28d2e","impliedFormat":1},{"version":"05c97cddbaf99978f83d96de2d8af86aded9332592f08ce4a284d72d0952c391","impliedFormat":1},{"version":"14e5cdec6f8ae82dfd0694e64903a0a54abdfe37e1d966de3d4128362acbf35f","impliedFormat":1},{"version":"bbc183d2d69f4b59fd4dd8799ffdf4eb91173d1c4ad71cce91a3811c021bf80c","impliedFormat":1},{"version":"7b6ff760c8a240b40dab6e4419b989f06a5b782f4710d2967e67c695ef3e93c4","impliedFormat":1},{"version":"8dbc4134a4b3623fc476be5f36de35c40f2768e2e3d9ed437e0d5f1c4cd850f6","impliedFormat":1},{"version":"4e06330a84dec7287f7ebdd64978f41a9f70a668d3b5edc69d5d4a50b9b376bb","impliedFormat":1},{"version":"65bfa72967fbe9fc33353e1ac03f0480aa2e2ea346d61ff3ea997dfd850f641a","impliedFormat":1},{"version":"c06f0bb92d1a1a5a6c6e4b5389a5664d96d09c31673296cb7da5fe945d54d786","impliedFormat":1},{"version":"f974e4a06953682a2c15d5bd5114c0284d5abf8bc0fe4da25cb9159427b70072","impliedFormat":1},{"version":"872caaa31423f4345983d643e4649fb30f548e9883a334d6d1c5fff68ede22d4","impliedFormat":1},{"version":"94404c4a878fe291e7578a2a80264c6f18e9f1933fbb57e48f0eb368672e389c","impliedFormat":1},{"version":"5c1b7f03aa88be854bc15810bfd5bd5a1943c5a7620e1c53eddd2a013996343e","impliedFormat":1},{"version":"09dfc64fcd6a2785867f2368419859a6cc5a8d4e73cbe2538f205b1642eb0f51","impliedFormat":1},{"version":"bcf6f0a323653e72199105a9316d91463ad4744c546d1271310818b8cef7c608","impliedFormat":1},{"version":"01aa917531e116485beca44a14970834687b857757159769c16b228eb1e49c5f","impliedFormat":1},{"version":"351475f9c874c62f9b45b1f0dc7e2704e80dfd5f1af83a3a9f841f9dfe5b2912","impliedFormat":1},{"version":"ac457ad39e531b7649e7b40ee5847606eac64e236efd76c5d12db95bf4eacd17","impliedFormat":1},{"version":"187a6fdbdecb972510b7555f3caacb44b58415da8d5825d03a583c4b73fde4cf","impliedFormat":1},{"version":"d4c3250105a612202289b3a266bb7e323db144f6b9414f9dea85c531c098b811","impliedFormat":1},{"version":"95b444b8c311f2084f0fb51c616163f950fb2e35f4eaa07878f313a2d36c98a4","impliedFormat":1},{"version":"741067675daa6d4334a2dc80a4452ca3850e89d5852e330db7cb2b5f867173b1","impliedFormat":1},{"version":"f8acecec1114f11690956e007d920044799aefeb3cece9e7f4b1f8a1d542b2c9","impliedFormat":1},{"version":"178071ccd043967a58c5d1a032db0ddf9bd139e7920766b537d9783e88eb615e","impliedFormat":1},{"version":"3a17f09634c50cce884721f54fd9e7b98e03ac505889c560876291fcf8a09e90","impliedFormat":1},{"version":"32531dfbb0cdc4525296648f53b2b5c39b64282791e2a8c765712e49e6461046","impliedFormat":1},{"version":"0ce1b2237c1c3df49748d61568160d780d7b26693bd9feb3acb0744a152cd86d","impliedFormat":1},{"version":"e489985388e2c71d3542612685b4a7db326922b57ac880f299da7026a4e8a117","impliedFormat":1},{"version":"5cad4158616d7793296dd41e22e1257440910ea8d01c7b75045d4dfb20c5a41a","impliedFormat":1},{"version":"04d3aad777b6af5bd000bfc409907a159fe77e190b9d368da4ba649cdc28d39e","affectsGlobalScope":true,"impliedFormat":1},{"version":"74efc1d6523bd57eb159c18d805db4ead810626bc5bc7002a2c7f483044b2e0f","impliedFormat":1},{"version":"19252079538942a69be1645e153f7dbbc1ef56b4f983c633bf31fe26aeac32cd","impliedFormat":1},{"version":"bc11f3ac00ac060462597add171220aed628c393f2782ac75dd29ff1e0db871c","impliedFormat":1},{"version":"616775f16134fa9d01fc677ad3f76e68c051a056c22ab552c64cc281a9686790","impliedFormat":1},{"version":"65c24a8baa2cca1de069a0ba9fba82a173690f52d7e2d0f1f7542d59d5eb4db0","impliedFormat":1},{"version":"f9fe6af238339a0e5f7563acee3178f51db37f32a2e7c09f85273098cee7ec49","impliedFormat":1},{"version":"3b0b1d352b8d2e47f1c4df4fb0678702aee071155b12ef0185fce9eb4fa4af1e","impliedFormat":1},{"version":"77e71242e71ebf8528c5802993697878f0533db8f2299b4d36aa015bae08a79c","impliedFormat":1},{"version":"a344403e7a7384e0e7093942533d309194ad0a53eca2a3100c0b0ab4d3932773","impliedFormat":1},{"version":"b7fff2d004c5879cae335db8f954eb1d61242d9f2d28515e67902032723caeab","impliedFormat":1},{"version":"5f3dc10ae646f375776b4e028d2bed039a93eebbba105694d8b910feebbe8b9c","impliedFormat":1},{"version":"bb18bf4a61a17b4a6199eb3938ecfa4a59eb7c40843ad4a82b975ab6f7e3d925","impliedFormat":1},{"version":"4545c1a1ceca170d5d83452dd7c4994644c35cf676a671412601689d9a62da35","impliedFormat":1},{"version":"e9b6fc05f536dfddcdc65dbcf04e09391b1c968ab967382e48924f5cb90d88e1","impliedFormat":1},{"version":"a2d648d333cf67b9aeac5d81a1a379d563a8ffa91ddd61c6179f68de724260ff","impliedFormat":1},{"version":"2b664c3cc544d0e35276e1fb2d4989f7d4b4027ffc64da34ec83a6ccf2e5c528","impliedFormat":1},{"version":"a3f41ed1b4f2fc3049394b945a68ae4fdefd49fa1739c32f149d32c0545d67f5","impliedFormat":1},{"version":"3cd8f0464e0939b47bfccbb9bb474a6d87d57210e304029cd8eb59c63a81935d","impliedFormat":1},{"version":"47699512e6d8bebf7be488182427189f999affe3addc1c87c882d36b7f2d0b0e","impliedFormat":1},{"version":"3026abd48e5e312f2328629ede6e0f770d21c3cd32cee705c450e589d015ee09","impliedFormat":1},{"version":"8b140b398a6afbd17cc97c38aea5274b2f7f39b1ae5b62952cfe65bf493e3e75","impliedFormat":1},{"version":"7663d2c19ce5ef8288c790edba3d45af54e58c84f1b37b1249f6d49d962f3d91","impliedFormat":1},{"version":"5cce3b975cdb72b57ae7de745b3c5de5790781ee88bcb41ba142f07c0fa02e97","impliedFormat":1},{"version":"00bd6ebe607246b45296aa2b805bd6a58c859acecda154bfa91f5334d7c175c6","impliedFormat":1},{"version":"ad036a85efcd9e5b4f7dd5c1a7362c8478f9a3b6c3554654ca24a29aa850a9c5","impliedFormat":1},{"version":"fedebeae32c5cdd1a85b4e0504a01996e4a8adf3dfa72876920d3dd6e42978e7","impliedFormat":1},{"version":"0d28b974a7605c4eda20c943b3fa9ae16cb452c1666fc9b8c341b879992c7612","impliedFormat":1},{"version":"cdf21eee8007e339b1b9945abf4a7b44930b1d695cc528459e68a3adc39a622e","impliedFormat":1},{"version":"db036c56f79186da50af66511d37d9fe77fa6793381927292d17f81f787bb195","impliedFormat":1},{"version":"87ac2fb61e629e777f4d161dff534c2023ee15afd9cb3b1589b9b1f014e75c58","impliedFormat":1},{"version":"13c8b4348db91e2f7d694adc17e7438e6776bc506d5c8f5de9ad9989707fa3fe","impliedFormat":1},{"version":"3c1051617aa50b38e9efaabce25e10a5dd9b1f42e372ef0e8a674076a68742ed","impliedFormat":1},{"version":"07a3e20cdcb0f1182f452c0410606711fbea922ca76929a41aacb01104bc0d27","impliedFormat":1},{"version":"1de80059b8078ea5749941c9f863aa970b4735bdbb003be4925c853a8b6b4450","impliedFormat":1},{"version":"1d079c37fa53e3c21ed3fa214a27507bda9991f2a41458705b19ed8c2b61173d","impliedFormat":1},{"version":"4cd4b6b1279e9d744a3825cbd7757bbefe7f0708f3f1069179ad535f19e8ed2c","impliedFormat":1},{"version":"5835a6e0d7cd2738e56b671af0e561e7c1b4fb77751383672f4b009f4e161d70","impliedFormat":1},{"version":"c0eeaaa67c85c3bb6c52b629ebbfd3b2292dc67e8c0ffda2fc6cd2f78dc471e6","impliedFormat":1},{"version":"4b7f74b772140395e7af67c4841be1ab867c11b3b82a51b1aeb692822b76c872","impliedFormat":1},{"version":"27be6622e2922a1b412eb057faa854831b95db9db5035c3f6d4b677b902ab3b7","impliedFormat":1},{"version":"b95a6f019095dd1d48fd04965b50dfd63e5743a6e75478343c46d2582a5132bf","impliedFormat":99},{"version":"c2008605e78208cfa9cd70bd29856b72dda7ad89df5dc895920f8e10bcb9cd0a","impliedFormat":99},{"version":"b97cb5616d2ab82a98ec9ada7b9e9cabb1f5da880ec50ea2b8dc5baa4cbf3c16","impliedFormat":99},{"version":"d23df9ff06ae8bf1dcb7cc933e97ae7da418ac77749fecee758bb43a8d69f840","affectsGlobalScope":true,"impliedFormat":1},{"version":"040c71dde2c406f869ad2f41e8d4ce579cc60c8dbe5aa0dd8962ac943b846572","affectsGlobalScope":true,"impliedFormat":1},{"version":"3586f5ea3cc27083a17bd5c9059ede9421d587286d5a47f4341a4c2d00e4fa91","impliedFormat":1},{"version":"a6df929821e62f4719551f7955b9f42c0cd53c1370aec2dd322e24196a7dfe33","impliedFormat":1},{"version":"b789bf89eb19c777ed1e956dbad0925ca795701552d22e68fd130a032008b9f9","impliedFormat":1},"9dd9d642cdb87d4d5b3173217e0c45429b3e47a6f5cf5fb0ead6c644ec5fed01",{"version":"4b2aab41b7e2a4295d252aff47b99f1c0ddc74bc9284dd0e8bda296ced817a61","impliedFormat":1},{"version":"a01035ec8ac796e720532f76a2f5ef957ec5ec6f022e5854e8522fa4fec3dd3a","impliedFormat":1},{"version":"a3628f430f8d502a5c026a0c932a5c41e6361d8e0248287872cd8999bc534399","impliedFormat":1},{"version":"ed774418ed7b67bf7c7c09afec04dc68aaf4b2ce34e83c8385ed32b836bfa1f5","impliedFormat":1},{"version":"b0c35bf00dd6fb25d84febff7590ac37528c99fcb452428b326fbed24dcb8d70","impliedFormat":1},{"version":"016eb46411ea55780ac3ccb57a10ae7d3de5f039a9b1c0889ebfe1bf4963c0af","impliedFormat":1},{"version":"f0e4a8414ebeccecd2eb57a7e4cf31e968e951126f45484d86fedc89dca61dec","impliedFormat":1},{"version":"ceb8fc6899a46dd58dd1f11077891ebf887a56e5fae8956c41d6dbac181bfe78","impliedFormat":1},{"version":"f1ab325fae2490d7933a0ec029a3e4df191d2022f5bf638acc9fb0bbc6a5792b","impliedFormat":1},{"version":"743ec4b877ee007e896a45ff5165100f793bef796938631051ad818039e238de","impliedFormat":1},{"version":"739ba5b048829e14de67e2fd9c067c28af878b65206a43ef0578552eedd8d8eb","impliedFormat":1},{"version":"509f00a10e4d37dd72e5d065054c430b3c1d4da788f4fe6a1fc15b91e60abf99","impliedFormat":1},{"version":"e2c737ecabdf5dde9d56d2675f5045d96c68383a5c019cb89b66b636185aa820","impliedFormat":1},{"version":"987c5db7454ad787d00334c97c761441f259ffab25495dc7d158cc8a7e9fd80a","impliedFormat":1},{"version":"c890847d746b7209ff5ec1d08c3ea02336f656f9190813e9ecb0d0ef938b4894","impliedFormat":1},{"version":"bd1586cd0ce05d2acb582596d81dfa433d96cd81bfed6bf4e75445e755f27a26","impliedFormat":99},{"version":"403d2da1db9a4b1790adb3c9a95afa7cc573e8a4348f64f047375ee10434f5a2","impliedFormat":1},{"version":"381b623c9ee962965cc3684ee45de6236f91cf24eb845dafc3a74a27d1eed070","impliedFormat":1},{"version":"1f84dff7964146377785aa684028ca62290e0639ac41fd0c5f391a5f5d414adc","impliedFormat":1},{"version":"4edf6371c3fd1f12c91cab0b0c42340ba0205e1a24f95757551ba46b6ab0e8a4","impliedFormat":1},{"version":"f4ae5546352701fd6932fdd86419438bb51253e4627a44808489742035bac644","impliedFormat":1},{"version":"dd033bfb97f7ce5f1d1443dbe8426c71fd7bed6ed37a17e9ecdf860d2e1927ac","impliedFormat":1},{"version":"ad4a445840097c8c5c00570c32950b24dc34a2310ed73c01128b7859ade4b97e","impliedFormat":1},{"version":"bb4f5627d1263f0b34a3580d2bf640085f7be9174d7dbe85e83999531291fe37","impliedFormat":1},{"version":"87b87f8f8e2e159f09fc254553c9f217ea9cf5d21f25714d8b528768d36b2818","impliedFormat":1},{"version":"9f673a4953dc682735441e2eba5275f59dbc63a4372f02a55293864bd5185669","impliedFormat":1},{"version":"1db8a09149ae91d1415011b68fa08a96e2a5e12bf78f175ce24c84806c124c52","impliedFormat":1},{"version":"021ed353ba1623ec4c783163b2e7a544db68764d20307788f00b5c16ce40f341","impliedFormat":1},{"version":"8b6581bd30c91d99d10a86efc9db6846b047d5bd037ecf36c23c026e8579d0fe","impliedFormat":1},{"version":"6b3d312e4a3be452af9aad07d1cc6036ef4a4d7571141f6d4ad820b86ef24ad8","impliedFormat":1},{"version":"f2737fe8c9a990d1963bf940e9e4fbb2c44dc2179b5f00accc548949aa0082ce","impliedFormat":1},{"version":"33899c60aea8188645a90bc029c0a98d18c5cb271de8a967c0a7e45698a28007","impliedFormat":1},{"version":"6b4cc716f171384a65f863080b6577fc1c45028490c5b0a35b3e31467e590b4d","impliedFormat":1},{"version":"54e425cf2edad78bbfb12e323d3328df6e5302d3c32f2844325930c0fe3e5683","impliedFormat":1},{"version":"6439e87bc08559db1ba6a4d7391dfbcd9ec5995ea8ec87b412940c50a947d713","impliedFormat":1},{"version":"dc18979157d4d0c265fa5284b7f600e6c1946b0a40f173a96217bd3d2bdd206a","impliedFormat":1},{"version":"4de37a70fd1fe48ce343176804343c189af257144ac52758de3d5c803d5c3234","impliedFormat":1},{"version":"b4bf4c5a667254a44966520963adefb1feddd2ebe82abdd42c93a9b22154068d","impliedFormat":1},{"version":"a53103b1db90b6c83c00cd9d18b3cf7920df8fdda196c330bc1092928d30d931","impliedFormat":1},{"version":"4ae9b50481136302de9c77668621ed3a0b34998f3e091ca3701426f4fe369c8a","impliedFormat":1},{"version":"9ba9ecc57d2f52b3ed3ac229636ee9a36e92e18b80eeae11ffb546c12e56d5e5","impliedFormat":1},{"version":"a35e372b741b6aaf27163d79224fb2d553443bb388c24f84fdde42a450c6e761","impliedFormat":1},{"version":"88b9f1dbe21ff13bc0a472af9e78b0fbdda6c7478f59e6a5ac205b61ecd4ae6a","impliedFormat":1},{"version":"6b1163dc8ac85260a60ffce42aed46411c5b508136e1b629282b3f08131b38da","impliedFormat":1},{"version":"ec3e143e22d0b8828c2b99ef926af7ef05475421866ca9915444b383cd9e1db1","impliedFormat":1},{"version":"c2e9ab4eb3c60bffaf2fcd7d84488d1dadf40123d3636909d86525dcb0ec0b16","impliedFormat":1},{"version":"2a23ef3132a5d05b7205c7af3cac333d183d90c6d09635e7ec213948a4ab6edd","impliedFormat":1},{"version":"5a7ebcf5fe8ac590dd03af1bbe426dfed639a3490fb1e5d6b934e45643b8ea1b","impliedFormat":1},{"version":"d3806a07e96dc0733fc9104eb4906c316f299b68b509da3604d8f21da04383b4","impliedFormat":1},{"version":"c83431bbdf4bc0275f48d6c63a33bdbda7cadd6658327db32c97760f2409afc1","impliedFormat":1},{"version":"881d40de44c5d815be8053b0761a4b3889443a08ccd4fa26423e1832f52d3bfb","impliedFormat":1},{"version":"b0315c558e6450590f260cc10ac29004700aa3960c9aef28f2192ffcf7e615f7","impliedFormat":1},{"version":"2ed360a6314d0aadeecb8491a6fde17b58b8464acde69501dbd7242544bcce57","impliedFormat":1},{"version":"4158a50e206f82c95e0ad4ea442ff6c99f20b5b85c5444474b8a9504c59294aa","impliedFormat":1},{"version":"c7a9dc2768c7d68337e05a443d0ce8000b0d24d7dfa98751173421e165d44629","impliedFormat":1},{"version":"d93cbdbf9cb855ad40e03d425b1ef98d61160021608cf41b431c0fc7e39a0656","impliedFormat":1},{"version":"561a4879505d41a27c404f637ae50e3da92126aa70d94cc073f6a2e102d565b0","impliedFormat":1},"6c729ac00d84755f1530fe55c5a93ef92ab50aa1c1026fc2daf5ba6ec4e8bcd1","7b8285b174b0c5221c8f60ca95997b32b0bd8615ec6557b617df3aae5ce35f65","8d659dd55e266dd9a2d5b7d3ea38db3130783fc3ffb59dd7ae0e60055458734d",{"version":"402e5c534fb2b85fa771170595db3ac0dd532112c8fa44fc23f233bc6967488b","impliedFormat":1},{"version":"8885cf05f3e2abf117590bbb951dcf6359e3e5ac462af1c901cfd24c6a6472e2","impliedFormat":1},{"version":"33f3718dababfc26dfd9832c150149ea4e934f255130f8c118a59ae69e5ed441","impliedFormat":1},{"version":"e61df3640a38d535fd4bc9f4a53aef17c296b58dc4b6394fd576b808dd2fe5e6","impliedFormat":1},{"version":"459920181700cec8cbdf2a5faca127f3f17fd8dd9d9e577ed3f5f3af5d12a2e4","impliedFormat":1},{"version":"4719c209b9c00b579553859407a7e5dcfaa1c472994bd62aa5dd3cc0757eb077","impliedFormat":1},{"version":"7ec359bbc29b69d4063fe7dad0baaf35f1856f914db16b3f4f6e3e1bca4099fa","impliedFormat":1},{"version":"70790a7f0040993ca66ab8a07a059a0f8256e7bb57d968ae945f696cbff4ac7a","impliedFormat":1},{"version":"d1b9a81e99a0050ca7f2d98d7eedc6cda768f0eb9fa90b602e7107433e64c04c","impliedFormat":1},{"version":"a022503e75d6953d0e82c2c564508a5c7f8556fad5d7f971372d2d40479e4034","impliedFormat":1},{"version":"b215c4f0096f108020f666ffcc1f072c81e9f2f95464e894a5d5f34c5ea2a8b1","impliedFormat":1},{"version":"644491cde678bd462bb922c1d0cfab8f17d626b195ccb7f008612dc31f445d2d","impliedFormat":1},{"version":"dfe54dab1fa4961a6bcfba68c4ca955f8b5bbeb5f2ab3c915aa7adaa2eabc03a","impliedFormat":1},{"version":"1bb61aa2f08ab4506d41dbe16c5f3f5010f014bbf46fa3d715c0cbe3b00f4e1c","impliedFormat":1},{"version":"47865c5e695a382a916b1eedda1b6523145426e48a2eae4647e96b3b5e52024f","impliedFormat":1},{"version":"e42820cd611b15910c204cd133f692dcd602532b39317d4f2a19389b27e6f03d","impliedFormat":1},{"version":"331b8f71bfae1df25d564f5ea9ee65a0d847c4a94baa45925b6f38c55c7039bf","impliedFormat":1},{"version":"2a771d907aebf9391ac1f50e4ad37952943515eeea0dcc7e78aa08f508294668","impliedFormat":1},{"version":"0146fd6262c3fd3da51cb0254bb6b9a4e42931eb2f56329edd4c199cb9aaf804","impliedFormat":1},{"version":"183f480885db5caa5a8acb833c2be04f98056bdcc5fb29e969ff86e07efe57ab","impliedFormat":99},{"version":"b558c9a18ea4e6e4157124465c3ef1063e64640da139e67be5edb22f534f2f08","impliedFormat":1},{"version":"01374379f82be05d25c08d2f30779fa4a4c41895a18b93b33f14aeef51768692","impliedFormat":1},{"version":"b0dee183d4e65cf938242efaf3d833c6b645afb35039d058496965014f158141","impliedFormat":1},{"version":"c0bbbf84d3fbd85dd60d040c81e8964cc00e38124a52e9c5dcdedf45fea3f213","impliedFormat":1},"a7d60212afebd4f9f6304ea872116b530a1c9e2d6faefc97e9c0ab732c9238db",{"version":"1d54173409366936e656b9e40f5a1de3d9b18223a9d36935e96f7f1da6a2345a","signature":"d44f0a42b8449f2fa39c0958efaa9a5192f13fdf162472f934dfd770c8e7150a"},"8e5fda2ffde00c9056609577b43ce5897667b626b3b66f56b18dcaddeb9a5c1c","2f9fa05478248a0335aac8db400fb8c47d3ecd776d762762fa1e1aa2b9f5e2fa",{"version":"a26d74bc8768e134734fa049d5a89fb674a560292f4bf1b39392416dc04cf49e","impliedFormat":99},{"version":"ea7f3d87bb25b8cf26c1b440de31b628c53b5e72e8f1ab1726356bf58acf5946","impliedFormat":99},{"version":"7ec047b73f621c526468517fea779fec2007dd05baa880989def59126c98ef79","impliedFormat":99},{"version":"148ad734850375f1a3d51523b329997d20d661381c7e9cbe26dd35e5238f8778","impliedFormat":99},{"version":"c57b441e0c0a9cbdfa7d850dae1f8a387d6f81cbffbc3cd0465d530084c2417d","impliedFormat":99},{"version":"2fbe402f0ee5aa8ab55367f88030f79d46211c0a0f342becaa9f648bf8534e9d","impliedFormat":1},{"version":"b94258ef37e67474ac5522e9c519489a55dcb3d4a8f645e335fc68ea2215fe88","impliedFormat":1},{"version":"7567368290de3f13978371a2ba42f900fd3a6ad47b2850dbf2ce2d2a65add90f","impliedFormat":1},{"version":"da72b2160aa234dd7e36b0e7642cbc16dba1f4fcb13b096698d5f2fac301219a","impliedFormat":1},"ccaad29ca0db4ee6ed3a67b81ce9eac203e7cab7595ef7a814a07bdc18b5d6f8","723d1642dc0505f598126581b27cf8a9f2a1ee383af5b3af06d3b908d9728e4a",{"version":"d72d1f8e6af178022142f45b368d7b45d0d8ba9d7d9e1dd3c71baacaf6e7f0bd","signature":"2f804fc4268db87bab8fa91464f922d5ef005eeb8e4a5408988cabc2d0d5d755"},"03e892344ad170438ccfc156b4ee7ff0be4e535a2939e038f64556ce03b934ed","d1fe2e6dc57232ad575ae9040b3d9d700cd575968a09ce15e4d29d7300b21328","7ea2caa869c9b02a8e4aae2c829b66787f71d970b06b5b0a453616166702a1ba","bbc5423d46cde8f39c3adf28d585500b2cd43ce7099b1e32c530ac78fd42ea17","0215782d8b846719cd1b1d7c2f0bc5ccf8f436a2e139794972c6b35522ebbcaa",{"version":"6b3edcafd375aac7e7a14309cc23c41ed9508e2b3fcca5d659b3c47e5a05f9cc","signature":"51229fb141cdfdd0b2b71dda104d7c5607ff50f148f1eeb94d6c95cf560bea6f"},"8ca3a5df1ee0728eb865566894429a035148de65e59318ca58d427f80039df29","e7068685563a36fd7da9bd97c9fe66f914fc682dcead10e5a9134c377fb18e64",{"version":"2cf84edb5635844129afdb601cf5684c5a56400d210751243a681cd04b57c1d9","impliedFormat":99},{"version":"c610cd8509928c67c5e3f9de30905cd1ede08208563cf789ca3dd9ee3a484927","impliedFormat":99},{"version":"414526d9290a176733f3a5eb959383c03b2fcd506978fb5ffc26788f201c970a","impliedFormat":99},{"version":"b526e8dcac876944abce9efd72b5ebc6b789d84870575842be8450c6d3c74c4a","impliedFormat":99},{"version":"65602b6521d79c38b911ab142fa8833b1460878d976c54b63b3cf2f3b86d7c00","impliedFormat":99},{"version":"d0fde7c862376189423d11930ca69a7cad0c017ffdec17c776d0d607ada8b4a3","impliedFormat":99},{"version":"4caa87fd9f69e1e15a1a57349948539b57041970086da342f7bd42ece1353c3a","impliedFormat":99},{"version":"db8ba14996f88e34f4af93b6816944c6ea5d4b703244abc61de67cfe7f488ce5","impliedFormat":99},{"version":"a3a51b4200f61ddf427f81fc42cb11936911d53714ad9a8b2677d32a548aad3e","impliedFormat":99},{"version":"81171f0b7b97b3bf0e8cd9fa599f23c7cd8e43f3c34f0c197b53cb5f4f55a25c","impliedFormat":99},{"version":"f722e6f337828933c52512cae32a8d9c9bb3e8409fbd39b4ab556d9f2e629b30","impliedFormat":99},{"version":"c9cce0fdbf1e23604904ca1a552ab26492aaf119f351775f0b6eb451301410fc","impliedFormat":99},{"version":"8f56bab88834bb5ff5d14063c0c7bcebebb9cab6893749605ea2ab0f8d0a879b","impliedFormat":99},{"version":"74690a0a01465cec515784e0a9059d286276148cc62208a4eb85566b6890e962","impliedFormat":99},{"version":"afd4f7197d02aeeb6bf1107176f99c0f1d6559cadbbec5c71c2b95f89e177912","impliedFormat":99},{"version":"619d880e788c5066831a64d18108a59acc6a5c06b2331fa0472c9480154d8746","impliedFormat":99},{"version":"ff0824d9a6582f789ced75948e309ad517a2b7aba097e0cc3cf8b7555dd5c790","impliedFormat":99},{"version":"a3d4e893a96bf59fcda0d99da5fe737e807f8d1e4226418fb94c547bdc441026","impliedFormat":99},{"version":"b5c09e3d2f3887fe27b1824c9106ab5e5c6ba50bd67e91fd68139445e730df35","impliedFormat":99},{"version":"21cafd7a40b56b799977e4c31dba190ecfe6bb1e5d6b56b0ee346194c7773924","impliedFormat":99},"119ba4cc24daf79c0087c4d032bc09efe5eb35a0c6ab7afd17b566c36e56f97f",{"version":"4d7d964609a07368d076ce943b07106c5ebee8138c307d3273ba1cf3a0c3c751","impliedFormat":99},{"version":"0e48c1354203ba2ca366b62a0f22fec9e10c251d9d6420c6d435da1d079e6126","impliedFormat":99},{"version":"0662a451f0584bb3026340c3661c3a89774182976cd373eca502a1d3b5c7b580","impliedFormat":99},"1b5815454052cb4e378497073b6ae83e400b4b6e8877accc946a7b0e2a0a81c8","0db674701ca30c01300ed1e030bfbd0c897f00bb6656ad6a025a3852d1f1a6f7","3290304d05c4c6bfb54f3c8f278ff1665d5a6733d037e58217596811c8dbe2e1","2d71f2335f24639aa9e00c61a44840fffc07cc8c83f698f8403eeda2c07902bc","da5892aad496d0048646898329dd3d6f2caf3d3ad446ccdda00424cf569cbc1a","4a087fc3f4ec1f21579b83a0b8b25ffa560261aa216b21ea1f4998ea3b4182a4","b9e09e278fa3fe2832edf5395bb3115d45a1870861da921130d71884a018247d","6c729ac00d84755f1530fe55c5a93ef92ab50aa1c1026fc2daf5ba6ec4e8bcd1","c3d4b65566273d456a626b7b70311bf5bfa72acd1a2bba223c643d5268ef97d4",{"version":"ae3c53d912112b2a2836c2866b6880152d054c49274ed2c26bebdad12c1b7278","signature":"5e217075e5bc7d40f1c4c77b9a965c007a5369b33087714e3a4532b09bc6ac2f"},{"version":"7323bea128da5b640a44fca49b469f1e1496168f33824451bb826d39edd155da","signature":"b9753e9ad5739c24ea68d6dba161c18296a2ec32ecb20fdc258b2be86bcebcce"},"b77578fff8d829252999b9dc56fdf7d77a9a1d384e9db60638e13546ff3da826","562a4fc3ea6f469062e9f3ff7e013342f6bd5aa166cfb21cf076b051ba2c562d","424b96ab4988962e48265aa0152b762c4938f3ca4144b591612babf62107d116","669a6c67bc626adc09a37bfb083168bfefe05c56d84a6fef6e844a538407a893","81f21a9e0d3be776451d98e332a9924479752aa1538394a57cc0ea0098226ba4","8af2dc42c6d490ddf0bfe5589782f49e7025226abd6783925243046490730ae8","d44d711d521a62e6cd212b6caf14dd2a5c5a3d81aa339e2c07a47f279d45d4e8","c3e9fe6ac92a39bf69fd8c638801aea6b62a0c5a77ff99ff7d541bc39732e8bc","45f9d6e1175eb8b0980d56d393822a51def98c92ed1ed979eb979f07b722b1f3","6aa6ed7d8fe40c54fafdb7331e32e2335059faa8962e6231cf0748337b5f70db","a8183622519d20fcb0c37e7009182b182383b80cc58e4b0062475504c4331971","c28d32815332f7b5649ae32a2f7ae430f2e7f1476adc564d5bd7c93d15a6ac45","ca37199bcc97b2cff2a5c1837627a84538f342078aa7d90074ebdc510412e5d3","80ff7efd853d97091cb2949ab0c1986b38477e2b198152dcb49d635961c03619","12566058bfd6d57d207642dcec6fe5e3b266a5638d355e9f31de4a536143c140",{"version":"fe93c474ab38ac02e30e3af073412b4f92b740152cf3a751fdaee8cbea982341","impliedFormat":1},{"version":"aa4feed67c9af19fa98fe02a12f424def3cdc41146fb87b8d8dab077ad9ceb3c","impliedFormat":1},{"version":"1e00b8bf9e3766c958218cd6144ffe08418286f89ff44ba5a2cc830c03dd22c7","impliedFormat":1},"a49b4e5ebe947428454491b3d55dc46c9bc7ac6a1e7263c5a9a3bfe3a43183dc","05e5b3eb44dce90b44e42ca3b4bdc582c5f4bf1652e38237ff7276aa6bd66d8f","ec3731eedf65d7d90ede266e64902ec19f12409347679b7022512afe694f9fb6",{"version":"a80b7bc4eda856374c26a56f6f25297f4c393309d4c4548002a5238cd57b2b66","impliedFormat":99},"c2b999a96781e6c932632bd089095368e973bf5602e1b1a62156b7d2b43f1e84",{"version":"8dd450de6d756cee0761f277c6dc58b0b5a66b8c274b980949318b8cad26d712","impliedFormat":99},{"version":"904d6ad970b6bd825449480488a73d9b98432357ab38cf8d31ffd651ae376ff5","impliedFormat":99},{"version":"dfcf16e716338e9fe8cf790ac7756f61c85b83b699861df970661e97bf482692","impliedFormat":99},"e76ddd9206edd9ac4e024e20db8a0c196835fe1f071141c0e0b9885b17bbb34d","bd780ba65167f75b7c7ea18b07e5547715275cb415b28a8919a8d955b3ffcd41",{"version":"ec69ebd1c4850514ebb6724911ad56e71caa0d076891ed6b67cb10d3ebbf2586","impliedFormat":99},{"version":"7a14bf21ae8a29d64c42173c08f026928daf418bed1b97b37ac4bb2aa197b89b","impliedFormat":99},"d41aded0394298102614635e15d709369c6bdae8fe79b918b8341ef39407ee03","6299a6a387dc55e528aec4342deaea0b83f1ea3a365c135a31a18ee55334f441",{"version":"71acd198e19fa38447a3cbc5c33f2f5a719d933fccf314aaff0e8b0593271324","impliedFormat":99},"2eac8fbb04002c42b0fbc4062d20d131e421796eaf65c37d2049e29e42ecbc5a","5950ac01377e7eedc94b00eb3fee678745e4cc1a72b5343867f0733d07db6660",{"version":"8c849d8fe5179b313bef5b3cb416a5efc080bf66b3ac0e7e3d88ea23c6dbac4d","signature":"6b6b51cfe00d5788406cbd662226143041b24ac430c7dce03346c9a410a154d1"},{"version":"6b5f886fe41e2e767168e491fe6048398ed6439d44e006d9f51cc31265f08978","impliedFormat":99},{"version":"f4a1eba860f7493d19df42373ddde4f3c6f31aa574b608e55e5b2bd459bba587","impliedFormat":99},{"version":"6b863463764ae572b9ada405bf77aac37b5e5089a3ab420d0862e4471051393b","impliedFormat":99},{"version":"89783bd45ab35df55203b522f8271500189c3526976af533a599a86caaf31362","impliedFormat":99},{"version":"26e6c521a290630ea31f0205a46a87cab35faac96e2b30606f37bae7bcda4f9d","impliedFormat":99},"dc109123ecd59af01d07aa9f3a8e8a7085bd3f337388c5369799ab1ce6c2d45f",{"version":"ecca37e3d338637bef3643dcb1da0b12d3209edacb0006c116cc780b48c74e51","signature":"d2ead9f2fbb260f258b010c555ac15e540c95968f950332e270b6520edd7cf81"},"e7c3bd287b33207514b74be896e0b7c36c9edffa39b775521956d910109552e6","525c4bb2c051987be64df0e92e1d90174912b219bf541e24ffbc4a3406de49e8","7af049b6c75fe2eebc11801220455826ca4bdcb91f49733b2af676f7a65bc37a","1863b9b73b955fd74c62c48521240d0e67ed38feeaf4523fa0ec4bf5b4567f24","1302de5390224cefd55ca8236e841e0493850dc56fa28e00752b9cf97d9fc433",{"version":"9acb9b1e9f845d3b08694852fa5996029bbf30ae8c02152e57bd3e664d4841e6","signature":"c533a01b7686c7123a4ca38757528e6b982dc1620df9404a5bf6af5af0a025da"},"de5f903448e6aa83ca985bf37bc2d055c57d7f7ba44dc272ba49b84e085ea1cf","cae37fdf9626bb34b0b2bdf06013328e4f03cd3ed0ca5116cedb769fbcc9ff55","75747b829620bccaf20439c75d7eb0388187719faf0f3e6ffca3cc6933f5350f",{"version":"31c30cc54e8c3da37c8e2e40e5658471f65915df22d348990d1601901e8c9ff3","impliedFormat":99},"15fe92a406d2fdc4c42e385699e5f690d103d70603a9d05aa837fd03423a7925","13a111a7bd9d142b2cf1b7bd71e919cf0e9895c9991c4b515d9d125a5ce7dc7b","146384c78b913d5e8d8f2189d9a1a0b5847c0d733261f53346abf7fe1fe5e7c4","64d28819c83aa4a0d380ddfbf29f193374878261980d15231b83efae74f0ae0b","62a231e85464b00597430ceca7e31d864e4cb01253be3791bb17346dc944c264","fdce706c54d98432ceead5db136f872c315d311700b50a1d34a5b0ee7acd1d5c","75747b829620bccaf20439c75d7eb0388187719faf0f3e6ffca3cc6933f5350f",{"version":"294c0200eb9f9f0b08f8c70c2c4e5d6fd8bf0d0ba19e850d147f723d7a33501a","impliedFormat":99},{"version":"b386e7b1fa1dca4a5ce1cb4ba97cf7288da377bddc7a0da1b3099c2cbe071067","impliedFormat":99},{"version":"e5c813d1eda908a823a49b560fb85aacb5e1c867132bf3758571128baba3ebee","impliedFormat":99},{"version":"914b10e122c91947fe38a9b88ab2902d1df81c1dd49ecc425a33afdf6b6b2351","impliedFormat":99},"c27852b26cff302477a7b22449dffa705594a70af7ef66eb30493801bcbbb56e","f8d491865882da7169293d5c9bc2a8ca9c8eff5d75735676e180a2e277bfabad","151de6bad29edee531f030c198173e7f98412c9cea095fd02f69a7ff68ae00c8","35a86f1abb6ae89b2db8e657afbca2f612e3c1cdf7771e7eb2efaf7ca1d3cc9d","d361bac28b980a8c0ba03af074f7a024c7c121411eb4109b69ff28dfa4271490","b44210de9ac11d020fdb407aa9ab465c6b7ecffaa7ce4d64ad325813e5e602f5","2638f2d180f663cd3c064444dfb036fced31d81555e21ee0981434fe9a814873","274e00fd87f877ce0451bc52451f214140dd2445d4d46c90c9d0540983e81fb8","895e0cbc92b540f028094b79614193d3b4c40ab1f2ab7b064cb7c11adfd966ab","8254174b22c47ad194e9e466522138122c1a23de58fc45144df891c316339d7c","4d8163b63ba1ca40ca987167935a8d1cf0eab3f4fbef37652d9ab1c87a44bf49","1fbaf4b7d6932a28fe12f3872e83153a49c03d84b7fdcb806ab368bb2baa359c",{"version":"cbcf2fd9f04db224e16247143975b8d1933f0754879cd99975f9bf2a82458886","signature":"cd11a04dc6a22c9cf508780bd08c5b2b0d5849c918c90f8260539d70f665ffce"},"f96abf77afb15161051b84116a8d5961e6ad18528bfcafb37ef2314750d5c71a","30a252cbe8a4e16a47442ffcdf3c4660ce8313f79aae997ec2a72ef7ed28ffb8","4a79a0a064ad84716ba50b6357bce42beffff62c4a3254687186ab39efc7c7df","119cb5d4a2fa1d7e4c01ff9b58a95079f305bd73dfcee6ee964199f20c4410ba","8c482a6f1b48d6775b6abf3a8202de55700e4f3c4e7ba5082142735faef05157","d924b1df48f41f0191616e62f3f68ba82d5c03c9392708a00bf9cc31e52be72e","76d8108d2ad01828ea94e3f46e2a4649f8d08947c62b7f8cf3302b7581431fea","e7ab36af52eee8926507b3fc3b0c49379996175ec30145f74e74ae806dbe6583","8eaf53ab8be1e6c8ab22e5d4cd45021ed08296a33322a36d97f993e452d8c5cd",{"version":"9d87588b24a4e7d7bd49c5441df46b38a6d863d52be0c2c3a7fceb2ba758d3f5","signature":"732802e323487c54e49f0b42f56bf9d4d3dc777f632d37229dabc754caa6f809"},"04af1b84862c39286eaf350b3122152c7806c42ff2abf47f56851ac2b48628b1",{"version":"233267a4a036c64aee95f66a0d31e3e0ef048cccc57dd66f9cf87582b38691e4","impliedFormat":99},"c4e268ace9d6e2d97af6ffa1c35046fb05732d112ca809192acabb6b8f887f93","3bc80a828aa1223d8354056e76b0e530c3fb334245db4ec87d78bdc7f82c38e0","21d1c30483f605ba462a412ae210209f149c1b3b2f0bdc151a259f49ca691b53","8395d1eacb9b8bdc75d36acb54ec13960595f5500775c73e197042f2aeeb68be","162491551b2ae55805da5d3e7590a84cc82d6db79e88ed502d4d0142e4e8d189","aa9f2067340a2c23464e03d8fa6a1299b5eeb6a16a6d11290ae34e35053dc5a3","fc8436555fdd7ba56747b852318933780c82ccea910dcce55dda431b452c2113","b681c107f27838fa59c05589d399a23b99bc467554515082ea8be575bff1ab51",{"version":"96d14f21b7652903852eef49379d04dbda28c16ed36468f8c9fa08f7c14c9538","impliedFormat":1},{"version":"d18f13c33148de7f0b1241734cb10dfe4c1e9505acad51ee48c3f4c1bd09e0dd","impliedFormat":1}],"root":[405,[463,465],[490,493],[503,513],534,[538,563],[567,569],571,575,576,579,580,[582,584],[590,600],[602,608],[613,636],[638,645]],"options":{"allowJs":true,"esModuleInterop":true,"jsx":1,"module":99,"skipLibCheck":true,"strict":true},"referencedMap":[[643,1],[644,2],[645,3],[641,4],[642,5],[492,6],[597,7],[493,8],[599,9],[600,10],[606,11],[607,12],[608,10],[630,13],[569,14],[596,15],[584,16],[598,17],[636,18],[615,19],[613,20],[639,21],[625,22],[640,23],[621,24],[616,23],[622,25],[617,26],[624,12],[619,27],[618,28],[620,24],[623,29],[604,30],[603,31],[631,32],[632,33],[633,33],[634,34],[594,35],[595,36],[592,37],[614,38],[605,39],[626,40],[591,41],[627,42],[628,43],[629,44],[567,45],[602,46],[583,47],[571,48],[593,49],[576,50],[590,51],[580,49],[582,52],[575,53],[579,54],[504,55],[568,56],[638,57],[505,58],[635,59],[506,58],[507,10],[534,60],[543,61],[538,12],[508,27],[509,10],[510,27],[512,62],[513,63],[540,64],[544,65],[545,10],[464,66],[491,67],[541,65],[546,68],[547,69],[548,70],[463,10],[511,10],[503,71],[549,72],[539,62],[550,73],[465,74],[405,75],[358,10],[601,76],[585,77],[494,12],[574,78],[496,77],[589,79],[572,77],[581,77],[588,80],[587,81],[573,77],[495,12],[577,82],[570,83],[578,84],[497,85],[637,86],[586,10],[445,87],[446,88],[442,89],[444,90],[448,91],[438,10],[439,92],[441,93],[443,93],[447,10],[440,94],[407,95],[408,96],[406,10],[420,97],[414,98],[419,99],[409,10],[417,100],[418,101],[416,102],[411,103],[415,104],[410,105],[412,106],[413,107],[430,108],[422,10],[425,109],[423,10],[424,10],[428,110],[429,111],[427,112],[455,113],[456,113],[462,114],[454,115],[460,10],[459,10],[458,116],[457,115],[461,117],[437,118],[431,10],[433,119],[432,10],[435,120],[434,121],[436,122],[452,123],[450,124],[449,125],[451,126],[646,10],[136,127],[137,127],[138,128],[97,129],[139,130],[140,131],[141,132],[92,10],[95,133],[93,10],[94,10],[142,134],[143,135],[144,136],[145,137],[146,138],[147,139],[148,139],[150,140],[149,141],[151,142],[152,143],[153,144],[135,145],[96,10],[154,146],[155,147],[156,148],[188,149],[157,150],[158,151],[159,152],[160,153],[161,154],[162,155],[163,156],[164,157],[165,158],[166,159],[167,159],[168,160],[169,10],[170,161],[172,162],[171,163],[173,164],[174,165],[175,166],[176,167],[177,168],[178,169],[179,170],[180,171],[181,172],[182,173],[183,174],[184,175],[185,176],[186,177],[187,178],[426,10],[84,10],[193,179],[194,180],[192,12],[190,181],[191,182],[82,10],[85,183],[281,12],[421,184],[647,184],[500,185],[499,186],[498,10],[453,10],[83,10],[515,187],[516,188],[514,10],[501,12],[91,189],[361,190],[365,191],[367,192],[214,193],[228,194],[332,195],[260,10],[335,196],[296,197],[305,198],[333,199],[215,200],[259,10],[261,201],[334,202],[235,203],[216,204],[240,203],[229,203],[199,203],[287,205],[288,206],[204,10],[284,207],[289,83],[376,208],[282,83],[377,209],[266,10],[285,210],[389,211],[388,212],[291,83],[387,10],[385,10],[386,213],[286,12],[273,214],[274,215],[283,216],[300,217],[301,218],[290,219],[268,220],[269,221],[380,222],[383,223],[247,224],[246,225],[245,226],[392,12],[244,227],[220,10],[395,10],[565,228],[564,10],[398,10],[397,12],[399,229],[195,10],[326,10],[227,230],[197,231],[349,10],[350,10],[352,10],[355,232],[351,10],[353,233],[354,233],[213,10],[226,10],[360,234],[368,235],[372,236],[209,237],[276,238],[275,10],[267,220],[295,239],[293,240],[292,10],[294,10],[299,241],[271,242],[208,243],[233,244],[323,245],[200,246],[207,247],[196,195],[337,248],[347,249],[336,10],[346,250],[234,10],[218,251],[314,252],[313,10],[320,253],[322,254],[315,255],[319,256],[321,253],[318,255],[317,253],[316,255],[256,257],[241,257],[308,258],[242,258],[202,259],[201,10],[312,260],[311,261],[310,262],[309,263],[203,264],[280,265],[297,266],[279,267],[304,268],[306,269],[303,267],[236,264],[189,10],[324,270],[262,271],[298,10],[345,272],[265,273],[340,274],[206,10],[341,275],[343,276],[344,277],[327,10],[339,246],[238,278],[325,279],[348,280],[210,10],[212,10],[217,281],[307,282],[205,283],[211,10],[264,284],[263,285],[219,286],[272,287],[270,288],[221,289],[223,290],[396,10],[222,291],[224,292],[363,10],[362,10],[364,10],[394,10],[225,293],[278,12],[90,10],[302,294],[248,10],[258,295],[237,10],[370,12],[379,296],[255,12],[374,83],[254,297],[357,298],[253,296],[198,10],[381,299],[251,12],[252,12],[243,10],[257,10],[250,300],[249,301],[239,302],[232,219],[342,10],[231,303],[230,10],[366,10],[277,12],[359,304],[81,10],[89,305],[86,12],[87,10],[88,10],[338,306],[331,307],[330,10],[329,308],[328,10],[369,309],[371,310],[373,311],[566,312],[375,313],[378,314],[404,315],[382,315],[403,316],[384,317],[390,318],[391,319],[393,320],[400,321],[402,10],[401,322],[356,323],[482,324],[480,325],[481,326],[469,327],[470,325],[477,328],[468,329],[473,330],[483,10],[474,331],[479,332],[485,333],[484,334],[467,335],[475,336],[476,337],[471,338],[478,324],[472,339],[609,10],[612,340],[610,10],[611,10],[517,341],[518,341],[523,342],[524,343],[532,344],[525,345],[527,346],[526,347],[528,348],[529,349],[531,350],[530,347],[533,351],[520,352],[522,353],[521,348],[519,10],[466,10],[502,10],[488,354],[487,10],[486,10],[489,355],[79,10],[80,10],[13,10],[14,10],[16,10],[15,10],[2,10],[17,10],[18,10],[19,10],[20,10],[21,10],[22,10],[23,10],[24,10],[3,10],[25,10],[26,10],[4,10],[27,10],[31,10],[28,10],[29,10],[30,10],[32,10],[33,10],[34,10],[5,10],[35,10],[36,10],[37,10],[38,10],[6,10],[42,10],[39,10],[40,10],[41,10],[43,10],[7,10],[44,10],[49,10],[50,10],[45,10],[46,10],[47,10],[48,10],[8,10],[54,10],[51,10],[52,10],[53,10],[55,10],[9,10],[56,10],[57,10],[58,10],[60,10],[59,10],[61,10],[62,10],[10,10],[63,10],[64,10],[65,10],[11,10],[66,10],[67,10],[68,10],[69,10],[70,10],[1,10],[71,10],[72,10],[12,10],[76,10],[74,10],[78,10],[73,10],[77,10],[75,10],[113,356],[123,357],[112,356],[133,358],[104,359],[103,360],[132,322],[126,361],[131,362],[106,363],[120,364],[105,365],[129,366],[101,367],[100,322],[130,368],[102,369],[107,370],[108,10],[111,370],[98,10],[134,371],[124,372],[115,373],[116,374],[118,375],[114,376],[117,377],[127,322],[109,378],[110,379],[119,380],[99,381],[122,372],[121,370],[125,10],[128,382],[537,383],[536,384],[535,10],[542,385],[555,386],[556,387],[557,388],[560,389],[558,390],[553,72],[559,391],[554,62],[551,392],[552,393],[490,394],[561,395],[562,396],[563,397]],"semanticDiagnosticsPerFile":[[464,[{"start":473,"length":18,"code":2769,"category":1,"messageText":{"messageText":"No overload matches this call.","category":1,"code":2769,"next":[{"messageText":"Overload 1 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServerDeprecated; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Type '(name: string, value: string, options: { path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }) => void' is not assignable to type 'SetCookie'.","category":1,"code":2322,"next":[{"messageText":"Types of parameters 'options' and 'options' are incompatible.","category":1,"code":2328,"next":[{"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'.","category":1,"code":2322,"next":[{"messageText":"Types of property 'sameSite' are incompatible.","category":1,"code":2326,"next":[{"messageText":"Type 'boolean | \"strict\" | \"lax\" | \"none\" | undefined' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'false' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'."}}]}]}]}]}]},{"messageText":"Overload 2 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Object literal may only specify known properties, and 'get' does not exist in type 'CookieMethodsServer'.","category":1,"code":2353}]}]},"relatedInformation":[{"file":"./node_modules/@supabase/ssr/dist/main/types.d.ts","start":1040,"length":3,"messageText":"The expected type comes from property 'set' which is declared here on type 'CookieMethodsServerDeprecated'","category":3,"code":6500},{"file":"./node_modules/@supabase/ssr/dist/main/createserverclient.d.ts","start":4537,"length":7,"messageText":"The expected type comes from property 'cookies' which is declared here on type 'SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }'","category":3,"code":6500}]},{"start":1633,"length":6,"code":2345,"category":1,"messageText":{"messageText":"Argument of type '[{ maxAge: number; path?: string | undefined; domain?: string | undefined; name: string; value: string; }]' is not assignable to parameter of type '[key: string, value: string] | [options: RequestCookie]'.","category":1,"code":2345,"next":[{"messageText":"Type '[{ maxAge: number; path?: string | undefined; domain?: string | undefined; name: string; value: string; }]' is not assignable to type '[options: RequestCookie]'.","category":1,"code":2322,"next":[{"messageText":"Object literal may only specify known properties, and 'maxAge' does not exist in type 'RequestCookie'.","category":1,"code":2353}]}]}}]],[491,[{"start":331,"length":22,"code":2769,"category":1,"messageText":{"messageText":"No overload matches this call.","category":1,"code":2769,"next":[{"messageText":"Overload 1 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServerDeprecated; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Type '(name: string, value: string, options: { path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }) => void' is not assignable to type 'SetCookie'.","category":1,"code":2322,"next":[{"messageText":"Types of parameters 'options' and 'options' are incompatible.","category":1,"code":2328,"next":[{"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'.","category":1,"code":2322,"next":[{"messageText":"Types of property 'sameSite' are incompatible.","category":1,"code":2326,"next":[{"messageText":"Type 'boolean | \"strict\" | \"lax\" | \"none\" | undefined' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'false' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'."}}]}]}]}]}]},{"messageText":"Overload 2 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Object literal may only specify known properties, and 'get' does not exist in type 'CookieMethodsServer'.","category":1,"code":2353}]}]},"relatedInformation":[{"file":"./node_modules/@supabase/ssr/dist/main/types.d.ts","start":1040,"length":3,"messageText":"The expected type comes from property 'set' which is declared here on type 'CookieMethodsServerDeprecated'","category":3,"code":6500},{"file":"./node_modules/@supabase/ssr/dist/main/createserverclient.d.ts","start":4537,"length":7,"messageText":"The expected type comes from property 'cookies' which is declared here on type 'SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }'","category":3,"code":6500}]}]],[505,[{"start":728,"length":9,"messageText":"'ADD_TOAST' refers to a value, but is being used as a type here. Did you mean 'typeof ADD_TOAST'?","category":1,"code":2749},{"start":788,"length":12,"messageText":"'UPDATE_TOAST' refers to a value, but is being used as a type here. Did you mean 'typeof UPDATE_TOAST'?","category":1,"code":2749},{"start":860,"length":13,"messageText":"'DISMISS_TOAST' refers to a value, but is being used as a type here. Did you mean 'typeof DISMISS_TOAST'?","category":1,"code":2749},{"start":921,"length":12,"messageText":"'REMOVE_TOAST' refers to a value, but is being used as a type here. Did you mean 'typeof REMOVE_TOAST'?","category":1,"code":2749},{"start":1449,"length":5,"messageText":"Function lacks ending return statement and return type does not include 'undefined'.","category":1,"code":2366},{"start":1562,"length":5,"code":2339,"category":1,"messageText":{"messageText":"Property 'toast' does not exist on type 'Action'.","category":1,"code":2339,"next":[{"messageText":"Property 'toast' does not exist on type '{ type: DISMISS_TOAST; toastId?: string | undefined; }'.","category":1,"code":2339}]}},{"start":1731,"length":5,"code":2339,"category":1,"messageText":{"messageText":"Property 'toast' does not exist on type 'Action'.","category":1,"code":2339,"next":[{"messageText":"Property 'toast' does not exist on type '{ type: DISMISS_TOAST; toastId?: string | undefined; }'.","category":1,"code":2339}]}},{"start":1760,"length":5,"code":2339,"category":1,"messageText":{"messageText":"Property 'toast' does not exist on type 'Action'.","category":1,"code":2339,"next":[{"messageText":"Property 'toast' does not exist on type '{ type: DISMISS_TOAST; toastId?: string | undefined; }'.","category":1,"code":2339}]}},{"start":1824,"length":7,"messageText":"Property 'toastId' does not exist on type 'Action'.","category":1,"code":2339},{"start":2431,"length":7,"code":2339,"category":1,"messageText":{"messageText":"Property 'toastId' does not exist on type 'Action'.","category":1,"code":2339,"next":[{"messageText":"Property 'toastId' does not exist on type '{ type: ADD_TOAST; toast: ToasterToast; }'.","category":1,"code":2339}]}},{"start":2625,"length":7,"code":2339,"category":1,"messageText":{"messageText":"Property 'toastId' does not exist on type 'Action'.","category":1,"code":2339,"next":[{"messageText":"Property 'toastId' does not exist on type '{ type: ADD_TOAST; toast: ToasterToast; }'.","category":1,"code":2339}]}}]],[541,[{"start":12529,"length":6,"code":2339,"category":1,"messageText":"Property 'status' does not exist on type 'StorageError'."}]],[542,[{"start":390,"length":11,"messageText":"Module '\"@/lib/supabase/storage\"' declares 'ProjectData' locally, but it is not exported.","category":1,"code":2459,"relatedInformation":[{"file":"./lib/supabase/storage.ts","start":115,"length":11,"messageText":"'ProjectData' is declared here.","category":3,"code":2728}]}]],[547,[{"start":413,"length":18,"code":2769,"category":1,"messageText":{"messageText":"No overload matches this call.","category":1,"code":2769,"next":[{"messageText":"Overload 1 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServerDeprecated; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Type '(name: string, value: string, options: { path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }) => void' is not assignable to type 'SetCookie'.","category":1,"code":2322,"next":[{"messageText":"Types of parameters 'options' and 'options' are incompatible.","category":1,"code":2328,"next":[{"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'.","category":1,"code":2322,"next":[{"messageText":"Types of property 'sameSite' are incompatible.","category":1,"code":2326,"next":[{"messageText":"Type 'boolean | \"strict\" | \"lax\" | \"none\" | undefined' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'false' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'."}}]}]}]}]}]},{"messageText":"Overload 2 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Object literal may only specify known properties, and 'get' does not exist in type 'CookieMethodsServer'.","category":1,"code":2353}]}]},"relatedInformation":[{"file":"./node_modules/@supabase/ssr/dist/main/types.d.ts","start":1040,"length":3,"messageText":"The expected type comes from property 'set' which is declared here on type 'CookieMethodsServerDeprecated'","category":3,"code":6500},{"file":"./node_modules/@supabase/ssr/dist/main/createserverclient.d.ts","start":4537,"length":7,"messageText":"The expected type comes from property 'cookies' which is declared here on type 'SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }'","category":3,"code":6500}]},{"start":1470,"length":6,"code":2345,"category":1,"messageText":{"messageText":"Argument of type '[{ maxAge: number; path?: string | undefined; domain?: string | undefined; name: string; value: string; }]' is not assignable to parameter of type '[key: string, value: string] | [options: RequestCookie]'.","category":1,"code":2345,"next":[{"messageText":"Type '[{ maxAge: number; path?: string | undefined; domain?: string | undefined; name: string; value: string; }]' is not assignable to type '[options: RequestCookie]'.","category":1,"code":2322,"next":[{"messageText":"Object literal may only specify known properties, and 'maxAge' does not exist in type 'RequestCookie'.","category":1,"code":2353}]}]}}]],[548,[{"start":239,"length":18,"code":2769,"category":1,"messageText":{"messageText":"No overload matches this call.","category":1,"code":2769,"next":[{"messageText":"Overload 1 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServerDeprecated; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Type '(name: string, value: string, options: { path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }) => void' is not assignable to type 'SetCookie'.","category":1,"code":2322,"next":[{"messageText":"Types of parameters 'options' and 'options' are incompatible.","category":1,"code":2328,"next":[{"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'.","category":1,"code":2322,"next":[{"messageText":"Types of property 'sameSite' are incompatible.","category":1,"code":2326,"next":[{"messageText":"Type 'boolean | \"strict\" | \"lax\" | \"none\" | undefined' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'false' is not assignable to type '\"strict\" | \"lax\" | \"none\" | undefined'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'Partial<SerializeOptions>' is not assignable to type '{ path?: string | undefined; maxAge?: number | undefined; domain?: string | undefined; secure?: boolean | undefined; sameSite?: \"strict\" | \"lax\" | \"none\" | undefined; }'."}}]}]}]}]}]},{"messageText":"Overload 2 of 2, '(supabaseUrl: string, supabaseKey: string, options: SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }): SupabaseClient<...>', gave the following error.","category":1,"code":2772,"next":[{"messageText":"Object literal may only specify known properties, and 'get' does not exist in type 'CookieMethodsServer'.","category":1,"code":2353}]}]},"relatedInformation":[{"file":"./node_modules/@supabase/ssr/dist/main/types.d.ts","start":1040,"length":3,"messageText":"The expected type comes from property 'set' which is declared here on type 'CookieMethodsServerDeprecated'","category":3,"code":6500},{"file":"./node_modules/@supabase/ssr/dist/main/createserverclient.d.ts","start":4537,"length":7,"messageText":"The expected type comes from property 'cookies' which is declared here on type 'SupabaseClientOptions<\"public\"> & { cookieOptions?: CookieOptionsWithName | undefined; cookies: CookieMethodsServer; cookieEncoding?: \"raw\" | ... 1 more ... | undefined; }'","category":3,"code":6500}]}]],[558,[{"start":58,"length":11,"messageText":"Module '\"@/lib/supabase/storage\"' declares 'ProjectData' locally, but it is not exported.","category":1,"code":2459,"relatedInformation":[{"file":"./lib/supabase/storage.ts","start":115,"length":11,"messageText":"'ProjectData' is declared here.","category":3,"code":2728}]}]],[616,[{"start":5919,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDropTarget' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]}]],[625,[{"start":2082,"length":17,"messageText":"Block-scoped variable 'filteredDropAreas' used before its declaration.","category":1,"code":2448,"relatedInformation":[{"start":2988,"length":17,"messageText":"'filteredDropAreas' is declared here.","category":3,"code":2728}]},{"start":2082,"length":17,"messageText":"Variable 'filteredDropAreas' is used before being assigned.","category":1,"code":2454}]],[628,[{"start":3604,"length":8,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type '\"desktop\" | \"tablet\" | \"mobile\"'.","relatedInformation":[{"file":"./components/preview/preview-block.tsx","start":171,"length":8,"messageText":"The expected type comes from property 'viewport' which is declared here on type 'IntrinsicAttributes & PreviewBlockProps'","category":3,"code":6500}]}]],[632,[{"start":344,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDragSource' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDragSource' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDragSource' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]}]],[633,[{"start":350,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDragSource' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDragSource' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDragSource' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]}]],[634,[{"start":3852,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDropTarget' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]},{"start":4795,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDropTarget' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]},{"start":5692,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDropTarget' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]}]],[640,[{"start":6275,"length":3,"code":2322,"category":1,"messageText":{"messageText":"Type 'ConnectDropTarget' is not assignable to type 'LegacyRef<HTMLDivElement> | undefined'.","category":1,"code":2322,"next":[{"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'ReactElement<any, string | JSXElementConstructor<any>> | null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'void | (() => VoidOrUndefinedOnly)'.","category":1,"code":2322}],"canonicalHead":{"code":2322,"messageText":"Type 'ConnectDropTarget' is not assignable to type '(instance: HTMLDivElement | null) => void | (() => VoidOrUndefinedOnly)'."}}]}]},"relatedInformation":[{"file":"./node_modules/@types/react/index.d.ts","start":10345,"length":3,"messageText":"The expected type comes from property 'ref' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'","category":3,"code":6500}]}]]],"affectedFilesPendingEmit":[643,644,645,641,642,492,597,493,599,600,606,607,608,630,569,596,584,598,636,615,613,639,625,640,621,616,622,617,624,619,618,620,623,604,603,631,632,633,634,594,595,592,614,605,626,591,627,628,629,567,602,583,571,593,576,590,580,582,575,579,504,568,638,505,635,506,507,534,543,538,508,509,510,512,513,540,544,545,464,491,541,546,547,548,463,511,503,549,539,550,465,542,555,556,557,560,558,553,559,554,551,552,490,561,562,563],"version":"5.8.2"}
```

# utils/supabase/client.ts

```ts
import { createBrowserClient } from "@supabase/ssr"

// Provide fallback values for development in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase URL or Anon Key not found. Using development mode with limited functionality.")
  }

  // If the instance already exists, return it
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Otherwise, create a new instance and store it
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}


```

# utils/supabase/middleware.ts

```ts
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

// Provide fallback values for development in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const createClient = (request: NextRequest) => {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase URL or Anon Key not found. Using development mode with limited functionality.")
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  return supabaseResponse
}


```

# utils/supabase/server.ts

```ts
import { createServerClient } from "@supabase/ssr"
import type { cookies } from "next/headers"

// Provide fallback values for development in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase URL or Anon Key not found. Using development mode with limited functionality.")
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}


```

# vitest.config.ts

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/setup.ts"],
    },
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

```

