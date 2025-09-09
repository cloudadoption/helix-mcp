# Demo Prompts (Copy/Paste Ready)

Replace placeholders before sending: {ORG}, {SITE}, {BRANCH}, {PATH}, {DOMAINKEY}.
Keep outputs brief and structured for on-screen clarity.

## Explicit Tool Execution

```text
Provide a listing of blog post pages on my site and how long ago they were published in hours, newest first
```

```text
Please find publication events for my site for the last 3 days. provide me a count for the number of times each page was published in that time perioud
```

## Development

### Planning
```text
I'd like to add a section to the homepage of my website with customer testimonials. This will be a new block which is an auto-rotating testimonials carousel.

Create a folder for the block and add to that folder a PLAN.md file. In that file, document a plan to implement the block, including both technical implementation steps as well as content structure so we will know how to author the content. The plan should also include some example content we can setup to test the block.

Use the docs-search, block-list, and block-details tools available to you to be sure the plan you make is as correct as possible. Be sure to include references in the plan file so they are available later when we do the implementation. Likewise, the plan can include code or pseudo-code snippets to highlight key parts of the implementation, but avoid large code blocks, or duplicating code that can be found at one of the references.
```

### Implementing

```text
I created a plan for a new testimonials block at @PLAN.md

Read over the plan, and implement the block. Use the docs-search, block-list, and block-details tools available to you where needed, though most of what you need should already be available in the plan. Please be sure to implement all of the planned features. Ensure all code passes lint checks and matches the style and standards for this project.

When you are done, create a README.md for the block documenting how the block works, the authoring options, and anything future developers may need to know that isn't obvious from the code. Keep this file to only the minimum required information so it can be easily consumed at a glance.
```

---

## Admin

### Chat Bot - finding unpublish pages

```text
I'd like to add a blog section to my website. The blog will consist of a landing page showing the latests posts, and individual blog post pages. Each post will have an author, a published date, and an image. Help me understand the steps I'll need to take to create the blog section and landing page. at this point, I'm not interested in code, just the actual process and steps to take. Please consult the aem documentation and include relevant documentation links

Your final output should be a high level list of what I need to do, what blocks/code changes we may need to make, etc. but don't include any extraneous steps or details
```


## Extras (Use selectively if time allows)

### Audit log quick scan
```text
Use audit-log with: org={ORG}, site={SITE}, branch={BRANCH}, since=24h. Return 5 notable entries (errors, slow ops >3s, publish events). Show: timestamp (UTC), route, path, status, duration, user.
```
