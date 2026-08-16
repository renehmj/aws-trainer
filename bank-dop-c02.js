/*
 * DOP-C02 — DevOps Engineer Professional question bank.
 *
 * Domains and weights (must match certs.js exactly) — note six, not four:
 *   "SDLC Automation"                        22%
 *   "Configuration Management and IaC"       17%
 *   "Resilient Cloud Solutions"              15%
 *   "Monitoring and Logging"                 15%
 *   "Incident and Event Response"            14%
 *   "Security and Compliance"                17%
 *
 * Exam: 75 questions, 180 minutes, pass 750/1000.
 *
 * DOP questions are automation-first: the right answer is usually the one that
 * removes human steps and works across accounts. Copy topic strings verbatim
 * from certs.js.
 */

window.BANKS = window.BANKS || {};
window.BANKS["DOP-C02"] = [

  /* ---------- SDLC Automation (22%) ---------- */

  {
    id: "sdlc-001",
    domain: "SDLC Automation",
    topic: "CodePipeline design",
    difficulty: "hard",
    type: "single",
    question:
      "A pipeline defined in a shared tooling account must deploy CloudFormation stacks into separate development, staging and production accounts. Artifacts are stored in S3 and encrypted with KMS. What is required for the cross-account deployments to work?",
    options: [
      { id: "A", text: "A deployment role in each target account trusted by the pipeline account, a customer managed KMS key on the artifact bucket shared with the target accounts, and a bucket policy granting them read access." },
      { id: "B", text: "An IAM user in each target account whose access keys are stored in the pipeline account's Secrets Manager." },
      { id: "C", text: "Making the artifact bucket public so target accounts can retrieve build outputs." },
      { id: "D", text: "A separate pipeline in each target account, triggered by a webhook from the tooling account." }
    ],
    correct: ["A"],
    explanation:
      "Cross-account CodePipeline deployment has three moving parts that must all line up: a role in the target account that the pipeline account can assume, artifact bucket permissions allowing the target account to read, and — because artifacts are encrypted — a customer managed KMS key whose policy grants those accounts decrypt. An AWS managed key cannot be shared this way, which is the detail most often missed.",
    whyWrong: {
      B: "Long-lived access keys are unnecessary when role assumption exists, and they create a credential to rotate and protect in perpetuity.",
      C: "A public artifact bucket exposes build output, which frequently contains configuration and source, to the internet.",
      D: "Duplicating the pipeline per account multiplies maintenance and loses the single promotion path that staged deployment depends on."
    }
  },

  {
    id: "sdlc-002",
    domain: "SDLC Automation",
    topic: "Deployment strategies",
    difficulty: "medium",
    type: "single",
    question:
      "An ECS service on Fargate must be updated with no downtime, traffic shifted to the new version only after automated tests pass against it, and an immediate return to the old version if error rates rise within the first hour. Which configuration achieves this?",
    options: [
      { id: "A", text: "CodeDeploy blue/green deployment for ECS with a test listener for validation hooks, and CloudWatch alarms configured to trigger automatic rollback during the bake period." },
      { id: "B", text: "An ECS rolling update with a minimum healthy percent of 100 and maximum percent of 200." },
      { id: "C", text: "Updating the task definition and forcing a new deployment, monitoring the service manually." },
      { id: "D", text: "Two ECS services behind weighted Route 53 records, adjusted by hand after testing." }
    ],
    correct: ["A"],
    explanation:
      "CodeDeploy blue/green for ECS stands up the replacement task set behind a test listener so hooks can validate it before any production traffic shifts, then shifts traffic and holds a bake period during which alarms can trigger an automatic rollback to the original task set.",
    whyWrong: {
      B: "A rolling update replaces tasks in place with no separate environment to test against, and rollback means another rolling deployment rather than an instant switch.",
      C: "Manual monitoring is neither automated validation nor automatic rollback.",
      D: "DNS weighting is slow to take effect because of resolver caching and requires manual intervention, so it cannot deliver an immediate rollback."
    }
  },

  {
    id: "sdlc-003",
    domain: "SDLC Automation",
    topic: "Automated testing in pipelines",
    difficulty: "medium",
    type: "single",
    question:
      "A team wants unit tests, static analysis and a security scan to run on every commit, with the pipeline stopping before deployment if any of them fail, and the results retained for audit. What is the appropriate design?",
    options: [
      { id: "A", text: "A CodeBuild test stage in CodePipeline running all three checks, reporting through CodeBuild test reports, with the stage failing the pipeline on a non-zero exit." },
      { id: "B", text: "A manual approval action where a reviewer confirms the tests were run locally." },
      { id: "C", text: "A post-deployment Lambda function that runs the checks and raises a ticket if they fail." },
      { id: "D", text: "A nightly CodeBuild project that scans the repository and emails the team." }
    ],
    correct: ["A"],
    explanation:
      "Putting the checks in a CodeBuild stage before the deploy stage makes them a gate: a non-zero exit fails the stage and the pipeline does not proceed. Test report groups retain structured results for audit, and everything runs automatically on every commit.",
    whyWrong: {
      B: "Manual attestation is not automation and gives no retained evidence of what actually ran.",
      C: "Running checks after deployment means faulty code has already reached the environment, which is what the gate is meant to prevent.",
      D: "A nightly scan detects problems up to a day late and does not block a deployment."
    }
  },

  {
    id: "sdlc-004",
    domain: "SDLC Automation",
    topic: "Artifact management and versioning",
    difficulty: "medium",
    type: "single",
    question:
      "An organization requires that the exact container image tested in staging is the one deployed to production, and that an image tag can never be repointed to different content after it is pushed. What should be configured?",
    options: [
      { id: "A", text: "Enable tag immutability on the ECR repository and promote images by digest between environments." },
      { id: "B", text: "Rebuild the image in each environment from the same commit hash." },
      { id: "C", text: "Always deploy the image tagged latest, refreshed at each promotion." },
      { id: "D", text: "Store built images as tar archives in a versioned S3 bucket." }
    ],
    correct: ["A"],
    explanation:
      "Tag immutability makes ECR reject a push that would overwrite an existing tag, and referring to images by digest guarantees byte-for-byte identity between what was tested and what is deployed. Together they close the gap the requirement describes.",
    whyWrong: {
      B: "Rebuilding produces a different image even from identical source, because base images and dependencies move; the tested artifact is not the deployed artifact.",
      C: "A mutable latest tag is the exact anti-pattern being prohibited — its content changes over time.",
      D: "S3 versioning preserves archives but abandons the container registry, and nothing prevents deploying a different archive than the one tested."
    }
  },

  /* ---------- Configuration Management and IaC (17%) ---------- */

  {
    id: "iac-001",
    domain: "Configuration Management and IaC",
    topic: "StackSets across accounts",
    difficulty: "medium",
    type: "single",
    question:
      "A security baseline stack must exist in every account in an organizational unit, and must be created automatically in any account added to that OU later, without an engineer running anything. What should be used?",
    options: [
      { id: "A", text: "A CloudFormation StackSet with service-managed permissions targeting the OU, with automatic deployment enabled." },
      { id: "B", text: "A CloudFormation StackSet with self-managed permissions, run manually when accounts are added." },
      { id: "C", text: "A Lambda function subscribed to organization events that deploys a stack into new accounts." },
      { id: "D", text: "A documented runbook for the platform team to follow during account creation." }
    ],
    correct: ["A"],
    explanation:
      "Service-managed StackSets integrate with Organizations: you target an OU rather than a list of accounts, and with automatic deployment enabled a new account joining that OU receives the stack automatically, while an account leaving it has the stack removed.",
    whyWrong: {
      B: "Self-managed permissions require explicit account lists and IAM roles you create in each target, and nothing happens automatically when accounts join.",
      C: "This is custom code duplicating a built-in capability, with its own failure modes and no drift handling.",
      D: "A runbook depends on a human remembering, which is what the requirement excludes."
    }
  },

  {
    id: "iac-002",
    domain: "Configuration Management and IaC",
    topic: "Configuration drift detection",
    difficulty: "medium",
    type: "single",
    question:
      "Engineers occasionally change resources in the console that were created by CloudFormation. The team needs to know when a stack no longer matches its template and to be alerted automatically. What should they implement?",
    options: [
      { id: "A", text: "Scheduled CloudFormation drift detection invoked by EventBridge, with results published to SNS." },
      { id: "B", text: "A pipeline stage that redeploys every stack nightly to overwrite manual changes." },
      { id: "C", text: "An SCP denying all console write actions in every account." },
      { id: "D", text: "AWS Config rules checking that resources have the correct tags." }
    ],
    correct: ["A"],
    explanation:
      "Drift detection compares the live resource configuration against the stack template and reports which resources and properties differ. Triggering it on a schedule through EventBridge and publishing results turns it into continuous monitoring rather than an occasional manual check.",
    whyWrong: {
      B: "Nightly redeployment can be destructive, hides that drift ever happened, and does not tell anyone what changed or why.",
      C: "Blanket console denial is a heavy-handed control that breaks legitimate read and break-glass workflows, and does not detect drift caused through the API.",
      D: "Tag compliance is unrelated to whether a resource matches its CloudFormation template."
    }
  },

  {
    id: "iac-003",
    domain: "Configuration Management and IaC",
    topic: "Systems Manager automation",
    difficulty: "medium",
    type: "single",
    question:
      "Several hundred EC2 instances across three accounts must receive operating system patches on a defined monthly window, with a report of which instances are compliant. Instances are in private subnets with no inbound access. What should the team use?",
    options: [
      { id: "A", text: "AWS Systems Manager Patch Manager with patch baselines and maintenance windows, using the SSM Agent and VPC endpoints for connectivity." },
      { id: "B", text: "A cron job on each instance running the package manager's update command." },
      { id: "C", text: "A Lambda function that SSHes into each instance using a stored private key." },
      { id: "D", text: "Rebuilding all instances monthly from a fresh AMI with no other tooling." }
    ],
    correct: ["A"],
    explanation:
      "Patch Manager applies patch baselines during maintenance windows and reports patch compliance per instance, and it works over the SSM Agent's outbound connection — through interface VPC endpoints for private subnets — so no inbound access is needed.",
    whyWrong: {
      B: "Per-instance cron gives no central scheduling, no baseline control and no compliance reporting.",
      C: "SSH from Lambda with a stored key reintroduces inbound access and a long-lived credential, and reports nothing.",
      D: "Immutable rebuilds are a legitimate strategy but require an image pipeline and deployment orchestration that this option does not include, and still leaves compliance unreported."
    }
  },

  /* ---------- Resilient Cloud Solutions (15%) ---------- */

  {
    id: "rcs-001",
    domain: "Resilient Cloud Solutions",
    topic: "Auto Scaling and self-healing",
    difficulty: "medium",
    type: "single",
    question:
      "Instances behind an ALB sometimes keep passing EC2 status checks while the application process is dead, and they stay in service. The team also needs new instances to complete a five-minute warm-up before receiving traffic. Which combination addresses both?",
    options: [
      { id: "A", text: "Set the Auto Scaling group health check type to ELB, and configure a health check grace period covering the warm-up." },
      { id: "B", text: "Shorten the ALB health check interval and reduce the deregistration delay." },
      { id: "C", text: "Enable instance scale-in protection and increase the cooldown period." },
      { id: "D", text: "Replace the target tracking policy with a scheduled scaling policy." }
    ],
    correct: ["A"],
    explanation:
      "EC2 status checks only verify the instance, so a dead application still passes; switching the group's health check type to ELB makes the load balancer's application-level verdict authoritative so failing instances are replaced. The health check grace period stops the group from judging an instance before its warm-up finishes.",
    whyWrong: {
      B: "Faster ALB checks change nothing while Auto Scaling is not consulting the ALB, and deregistration delay concerns instances leaving, not arriving.",
      C: "Scale-in protection actively prevents the replacement the design needs.",
      D: "Scaling policy choice governs when capacity changes, not how unhealthy instances are detected or warmed up."
    }
  },

  {
    id: "rcs-002",
    domain: "Resilient Cloud Solutions",
    topic: "Backup and disaster recovery automation",
    difficulty: "medium",
    type: "single",
    question:
      "A compliance team requires that backups of EBS, RDS and DynamoDB across all accounts follow one retention policy, are copied to a second Region, and cannot be deleted early by anyone including an account administrator. What should be implemented?",
    options: [
      { id: "A", text: "AWS Backup with organization-level backup policies, cross-Region copy in the backup plan, and Vault Lock in compliance mode." },
      { id: "B", text: "Per-account Data Lifecycle Manager policies with a Lambda function copying snapshots cross-Region." },
      { id: "C", text: "A nightly script assuming a role in each account and calling each service's snapshot API." },
      { id: "D", text: "S3 Cross-Region Replication with Object Lock on an export bucket." }
    ],
    correct: ["A"],
    explanation:
      "AWS Backup spans all three services from one control plane, backup policies can be applied organization-wide through Organizations, backup plans handle cross-Region copies, and Vault Lock in compliance mode makes recovery points immutable until expiry — not even the root user can delete them early.",
    whyWrong: {
      B: "Data Lifecycle Manager covers EBS snapshots and AMIs only, so RDS and DynamoDB fall outside it, and the copy function is code to maintain.",
      C: "Bespoke scripting per service and account is fragile and provides no immutability guarantee.",
      D: "Object Lock protects S3 objects, but the sources are EBS, RDS and DynamoDB, which something else would first have to export."
    }
  },

  /* ---------- Monitoring and Logging (15%) ---------- */

  {
    id: "mon-001",
    domain: "Monitoring and Logging",
    topic: "Centralized logging architecture",
    difficulty: "hard",
    type: "single",
    question:
      "Application logs from 40 accounts must land in a central account for search and long-term retention, in near real time, without engineers deploying custom forwarders in each account. Which architecture fits?",
    options: [
      { id: "A", text: "CloudWatch Logs subscription filters in each account sending to a Kinesis Data Firehose destination in the central account, delivering to S3 and OpenSearch." },
      { id: "B", text: "A scheduled Lambda function in the central account calling GetLogEvents across all accounts." },
      { id: "C", text: "Exporting log groups to S3 with a daily create-export-task in each account." },
      { id: "D", text: "Installing a third-party log shipper on every instance, pointing at a central collector." }
    ],
    correct: ["A"],
    explanation:
      "Subscription filters stream log events out of CloudWatch Logs as they arrive, and a cross-account destination backed by Firehose handles buffering, transformation and delivery to S3 for retention and OpenSearch for search. It is near real time and uses managed components rather than per-account custom code.",
    whyWrong: {
      B: "Polling GetLogEvents across 40 accounts is slow, rate limited, and turns into a substantial piece of code to maintain.",
      C: "Export tasks are batch operations suited to archival, delivering data hours late rather than in near real time.",
      D: "Agents on instances miss logs from managed services such as Lambda and RDS, and add fleet-wide software to maintain."
    }
  },

  {
    id: "mon-002",
    domain: "Monitoring and Logging",
    topic: "CloudWatch metrics, alarms and dashboards",
    difficulty: "medium",
    type: "single",
    question:
      "On-call engineers are being paged whenever CPU is briefly high on any single instance, which is almost always harmless. They only want to be paged when high CPU coincides with elevated ALB target response time. What should be configured?",
    options: [
      { id: "A", text: "A composite alarm that fires only when both the CPU alarm and the latency alarm are in ALARM state." },
      { id: "B", text: "A higher CPU threshold on the existing alarm." },
      { id: "C", text: "A longer evaluation period on the CPU alarm." },
      { id: "D", text: "A dashboard combining both metrics for the on-call engineer to check." }
    ],
    correct: ["A"],
    explanation:
      "Composite alarms combine other alarms with a rule expression, so a page fires only when the combination indicates real customer impact. That is precisely the requirement — CPU alone is noise, CPU plus latency is a signal — and it reduces alert fatigue without losing coverage.",
    whyWrong: {
      B: "A higher threshold still pages on a single metric and risks missing genuine incidents that occur below the new threshold.",
      C: "A longer period delays the page but does not correlate the two signals, so harmless sustained CPU still pages.",
      D: "A dashboard is not alerting; someone has to be looking at it."
    }
  },

  {
    id: "mon-003",
    domain: "Monitoring and Logging",
    topic: "Log analysis with Logs Insights and OpenSearch",
    difficulty: "medium",
    type: "single",
    question:
      "During incidents, engineers need to run ad-hoc aggregations over the last few days of CloudWatch Logs — counting errors by request path and computing percentiles — without building a separate analytics stack. What is the most direct capability?",
    options: [
      { id: "A", text: "CloudWatch Logs Insights queries against the relevant log groups." },
      { id: "B", text: "Exporting logs to S3 and querying with Athena." },
      { id: "C", text: "Streaming logs to Amazon OpenSearch Service and building dashboards." },
      { id: "D", text: "Downloading log files locally and processing them with a script." }
    ],
    correct: ["A"],
    explanation:
      "Logs Insights runs a purpose-built query language directly over CloudWatch Logs with no data movement and no infrastructure, and supports aggregation functions including counts, statistics and percentiles. For ad-hoc incident investigation over recent data, it is the shortest path.",
    whyWrong: {
      B: "Athena over exported logs is powerful for large historical analysis, but the export and partitioning step makes it too slow during an incident.",
      C: "OpenSearch is the right answer when you need rich dashboards and long retention, but standing it up is the separate analytics stack the requirement excludes.",
      D: "Manual downloading does not scale and loses the audit trail of what was investigated."
    }
  },

  /* ---------- Incident and Event Response (14%) ---------- */

  {
    id: "inc-001",
    domain: "Incident and Event Response",
    topic: "Automated remediation with SSM and Lambda",
    difficulty: "medium",
    type: "single",
    question:
      "Whenever a security group is modified to allow 0.0.0.0/0 on port 22, the change must be reverted automatically within minutes and the security team notified, across all accounts. What should the team build?",
    options: [
      { id: "A", text: "An AWS Config rule detecting the condition, with automatic remediation through an SSM Automation document and an EventBridge rule notifying SNS." },
      { id: "B", text: "A CloudTrail alarm that emails the security team so they can revert the change manually." },
      { id: "C", text: "An SCP denying ec2:AuthorizeSecurityGroupIngress in all accounts." },
      { id: "D", text: "A weekly report listing security groups with open SSH access." }
    ],
    correct: ["A"],
    explanation:
      "Config evaluates the rule as the change is recorded, and an associated remediation action running an SSM Automation document reverts the offending rule without a human. EventBridge on the compliance-change event delivers the notification, so detection, correction and alerting are all automatic.",
    whyWrong: {
      B: "Email plus manual reversion is exactly the human step the requirement removes, and response time depends on who is awake.",
      C: "Denying the API outright blocks all legitimate security group changes, not just the dangerous rule.",
      D: "A weekly report leaves the exposure open for up to a week."
    }
  },

  {
    id: "inc-002",
    domain: "Incident and Event Response",
    topic: "Automatic rollback on failure",
    difficulty: "medium",
    type: "single",
    question:
      "A CloudFormation deployment to production occasionally succeeds structurally while the application it deploys begins failing health checks. The team wants the stack update to roll back automatically when that happens rather than leaving a broken release in place. What should be configured?",
    options: [
      { id: "A", text: "Rollback triggers on the stack update, referencing CloudWatch alarms that watch application health during a monitoring period." },
      { id: "B", text: "A manual approval step after the deployment stage." },
      { id: "C", text: "Termination protection on the stack." },
      { id: "D", text: "A DeletionPolicy of Retain on the stack's resources." }
    ],
    correct: ["A"],
    explanation:
      "Rollback triggers let a stack update monitor specified CloudWatch alarms for a defined period after resources are created or updated. If an alarm fires within that window CloudFormation rolls the stack back automatically, which catches exactly the case where deployment succeeds but the application is unhealthy.",
    whyWrong: {
      B: "A manual approval depends on someone noticing and acting, and typically gates before deployment rather than reacting to post-deployment health.",
      C: "Termination protection prevents stack deletion; it has no bearing on update health.",
      D: "DeletionPolicy governs what happens to resources when they are removed, not whether a bad update is reverted."
    }
  },

  /* ---------- Security and Compliance (17%) ---------- */

  {
    id: "psec-001",
    domain: "Security and Compliance",
    topic: "Automated compliance with Config rules",
    difficulty: "medium",
    type: "single",
    question:
      "An auditor requires continuous evidence that every account applies the same set of configuration controls, with a single compliance view and the ability to add new controls organization-wide in one action. What should be deployed?",
    options: [
      { id: "A", text: "AWS Config conformance packs deployed organization-wide, with an aggregator in the audit account." },
      { id: "B", text: "Individual Config rules created by each account team, reviewed centrally each quarter." },
      { id: "C", text: "AWS Trusted Advisor checks exported monthly to a spreadsheet." },
      { id: "D", text: "A Lambda function per account evaluating resources against a JSON policy file." }
    ],
    correct: ["A"],
    explanation:
      "A conformance pack is a bundle of Config rules and remediation actions deployed as a single unit, and it can be deployed across an organization so every account gets the identical set. An aggregator collects compliance data from all accounts and Regions into one view for the auditor.",
    whyWrong: {
      B: "Per-account rule authoring guarantees divergence and gives no single view or one-action rollout.",
      C: "Trusted Advisor offers a fixed set of best-practice checks, not a customisable control framework with continuous evidence.",
      D: "Custom evaluation code in every account is substantial work duplicating a managed service, without aggregation."
    }
  },

  {
    id: "psec-002",
    domain: "Security and Compliance",
    topic: "Secrets and credential rotation",
    difficulty: "medium",
    type: "single",
    question:
      "Database credentials used by applications in several accounts must rotate every 30 days with no downtime, and applications must never hold a credential in a configuration file. Which design meets this?",
    options: [
      { id: "A", text: "Store the credential in AWS Secrets Manager with managed rotation, share the secret cross-account via its resource policy and a customer managed KMS key, and have applications retrieve it at runtime through an IAM role." },
      { id: "B", text: "Store the credential in Systems Manager Parameter Store as a SecureString and rotate it with a scheduled Lambda function the team writes." },
      { id: "C", text: "Distribute the credential through an encrypted configuration file deployed by the pipeline every 30 days." },
      { id: "D", text: "Use a single long-lived credential protected by a strong password policy." }
    ],
    correct: ["A"],
    explanation:
      "Secrets Manager provides managed rotation for supported databases, including the two-user strategy that avoids downtime during the swap. A resource policy plus a customer managed KMS key allows other accounts to retrieve the secret, and runtime retrieval through an IAM role means nothing is stored in configuration.",
    whyWrong: {
      B: "Parameter Store has no built-in rotation, so the team owns the rotation logic and its failure modes — the requirement is achievable but with materially more effort and risk.",
      C: "A file on disk is a stored credential, which the requirement forbids, and pipeline-driven replacement risks a window where the old value is still in use.",
      D: "A static credential does not rotate at all."
    }
  },

  {
    id: "psec-003",
    domain: "Security and Compliance",
    topic: "Least-privilege automation and Access Analyzer",
    difficulty: "hard",
    type: "single",
    question:
      "A platform team must tighten dozens of over-permissive IAM roles without breaking the workloads that use them, and must be alerted if any role or bucket is ever shared with an external principal. Which combination should they use?",
    options: [
      { id: "A", text: "IAM Access Analyzer policy generation from CloudTrail activity to right-size each role, plus external access analyzers to detect resources shared outside the organization." },
      { id: "B", text: "Replace every role's policy with a deny-all policy and reinstate permissions as teams report breakage." },
      { id: "C", text: "Attach permissions boundaries to all roles and leave the existing policies unchanged." },
      { id: "D", text: "Enable GuardDuty and act on its IAM findings." }
    ],
    correct: ["A"],
    explanation:
      "Access Analyzer can generate a policy from the actions a role actually used, recorded in CloudTrail, which is how you tighten permissions without guessing and breaking workloads. Its external access findings separately identify roles, buckets and other resources shared with principals outside the organization.",
    whyWrong: {
      B: "Deliberately breaking production to discover requirements is an outage strategy, not a least-privilege strategy.",
      C: "Boundaries cap maximum permissions and are useful, but they do not reduce what the existing policies grant within that cap, nor detect external sharing.",
      D: "GuardDuty detects suspicious activity such as credential misuse; it does not right-size policies or enumerate external access."
    }
  }

];
