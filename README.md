## PR Approval System
### Assumptions
- User can signup to the portal either as a requester or approver or both. So there are two roles.
- If user has signed up as a requester, they can only create, view, update and delete PRs and request approvals.
- If user has signed up as an approver, they can only view, approve the PRs, and add comments (review) to the PRs.
- If user has signed up as both, they can perform all actions gievn that they have access to.
- User can create PRs and provide a list of emails of approvers. Approvers must be present in DB and have the approver role otherwise user will get error.
- They can choose PR approval Type - Sequential or Parallel.
- On th portal, all the prs will be dispalyed to the user which they have created or have been requested the review of.
- Approvers can approve or reject the PR based on the sequential or parallel flow.
- In sequential flow, if any of the approver rejects the PR, the PR is rejected.
- In parallel flow, after all the approvers has taken decision, and if any of them rejects the PR, the PR is rejected.
