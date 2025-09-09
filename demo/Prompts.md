# Demo Prompts (Copy/Paste Ready)

Replace placeholders before sending: {ORG}, {SITE}, {BRANCH}, {PATH}, {DOMAINKEY}.
Keep outputs brief and structured for on-screen clarity.

## Section 2: Plan and Implement a Blog

### 2.1 Plan the implementation and discover patterns/references
```text
I'd like to add a blog section to my website. The blog will consists of a landing page showing the latests posts, and individual blog post pages. Each post will have a title, description, author, published date, and an image.

Create a BLOG-PLAN.md file. In that file, document a plan to implement the blog, including both technical implementation steps as well as content structure so we will know how to author the content.

Use the docs-search, block-list, and block-details tools available to you to be sure the plan you make is as correct as possible. Be sure to include references in the plan file so they are available later when we do the implementation. Likewise, the plan can include code or pseudo-code snippets to highlight key parts of the implementation, but avoid large code blocks, or duplicating code that can be found at one of the references.
```

### 2.2 Implement Blog List

```text
I created a plan for a blog in this site. that can be found @BLOG-PLAN.md

Read over the plan, and implement the blog-list block it calls for (step 4 in the implementation plan). Use the docs-search, block-list, and block-details tools available to you where needed, though most of what you need should already be available in the plan. Please be sure to implement all of the planned features. Ensure all code passes lint checks and matches the style and standards for this project.

When you are done, create a README.md for the block documenting how the block works, authoring options, and anything future developers may need to know that isn't obvious from the code.
```

### 2.3 Implement autoblocking

```text
I created a plan for a blog in this site. that can be found @BLOG-PLAN.md

Read over the plan, and implement the blog-list block it calls for (step 4). Use the docs-search, block-list, and block-details tools available to you where needed, though most of what you need should already be available in the plan. Please be sure to implement all of the planned features. Ensure all code passes lint checks and matches the style and standards for this project.

When you are done, create a README.md for the block documenting how the block works, authoring options, and anything future developers may need to know that isn't obvious from the code.
```

### 2.4 Implement SEO Schema

---

## Section 3: 

### 3.1 Plan steps to implement a Blog
```text
I'd like to add a blog section to my website. The blog will consist of a landing page showing the latests posts, and individual blog post pages. Each post will have an author, a published date, and an image. Help me understand the steps I'll need to take to create the blog section and landing page. at this point, I'm not interested in code, just the actual process and steps to take. Please consult the aem documentation and include relevant documentation links

Your final output should be a high level list of what I need to do, what blocks/code changes we may need to make, etc. but don't include any extraneous steps or details```

---

## Section 4: Page Status + Publishing Workflow

### 4.1 Site-wide unpublished changes
```text
Using the helix-mcp tools find any blog post pages on my site that have been previewed, but not published. For our purposes, a pages is not published if it has no publishLastModified date. For each of those pages, fetch the content of the post and tell me it's author. Report the result in a single list with links to the pages in question
```

---

## Extras (Use selectively if time allows)

### Audit log quick scan
```text
Use audit-log with: org={ORG}, site={SITE}, branch={BRANCH}, since=24h. Return 5 notable entries (errors, slow ops >3s, publish events). Show: timestamp (UTC), route, path, status, duration, user.
```

### Performance spot check (RUM)
```text
Use rum-data with: url=https://{SITE}--{ORG}.aem.live/, domainkey={DOMAINKEY}, aggregation=lcp. Return just the p75 value and the dateRange.
```
