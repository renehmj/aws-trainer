/*
 * Certification paths and their syllabus.
 *
 * Each path is fully separate: its own question bank file, its own domains and
 * exam rules, and its own adaptive progress in localStorage (key
 * "trainer_v2::<id>"). Studying one path never affects another's statistics.
 *
 * Each domain carries a `topics` list — the canonical subject labels for that
 * domain. The Subjects view shows the union of these and whatever topics the
 * bank actually uses, so the full study surface is browsable before a single
 * question exists, and coverage gaps are visible.
 *
 * IMPORTANT: when writing a question, copy a topic string from here verbatim.
 * The engine tracks accuracy per "domain :: topic", so a near-miss label
 * ("SQS decoupling" vs "Decoupling with SQS") silently creates a second subject.
 *
 * To add a path: append an entry here and create a matching bank file that does
 *   window.BANKS = window.BANKS || {};
 *   window.BANKS["<id>"] = [ …questions… ];
 * then add a <script> tag for it in index.html.
 */

window.CERTS = [
  {
    id: "SAA-C03",
    short: "SAA",
    name: "Solutions Architect – Associate",
    phase: 1,
    order: 1,
    exam: { questions: 65, minutes: 130, pass: 720, min: 100, max: 1000 },
    domains: [
      {
        name: "Design Secure Architectures", weight: 0.30, prefix: "sec",
        topics: [
          "IAM policy evaluation",
          "Cross-account access with IAM roles",
          "Identity federation and IAM Identity Center",
          "Application authentication with Cognito",
          "Organizations SCPs and guardrails",
          "Multi-account governance with Control Tower",
          "S3 encryption options",
          "KMS key policies and grants",
          "Secrets management and rotation",
          "S3 access controls and Block Public Access",
          "Security groups vs NACLs",
          "VPC subnet and IP addressing design",
          "VPC connectivity: peering, Transit Gateway and VPN",
          "VPC endpoints and private connectivity",
          "Edge protection with WAF and Shield",
          "Certificate management and encryption in transit",
          "Threat detection with GuardDuty and Security Hub",
          "Auditing with CloudTrail and Config"
        ]
      },
      {
        name: "Design Resilient Architectures", weight: 0.26, prefix: "res",
        topics: [
          "RDS Multi-AZ vs read replicas",
          "Aurora high availability",
          "Auto Scaling and health checks",
          "Stateless application design",
          "Decoupling with SQS",
          "Event-driven patterns with EventBridge",
          "Route 53 routing policies",
          "Load balancer selection",
          "S3 durability and replication",
          "Disaster recovery strategies",
          "Multi-AZ vs multi-Region design",
          "Backup and restore with AWS Backup",
          "Monitoring and alarms with CloudWatch",
          "Fault isolation and blast radius"
        ]
      },
      {
        name: "Design High-Performing Architectures", weight: 0.24, prefix: "perf",
        topics: [
          "EBS volume type selection",
          "Shared file storage selection",
          "Compute selection for workloads",
          "Containers on ECS, EKS and Fargate",
          "Serverless compute with Lambda",
          "Placement groups and HPC networking",
          "Read scaling with ElastiCache",
          "Aurora endpoints and read scaling",
          "Aurora Serverless capacity planning",
          "DynamoDB performance and caching",
          "CloudFront and content delivery",
          "Global Accelerator vs CloudFront",
          "Streaming ingestion with Kinesis",
          "Analytics with Athena and Redshift",
          "Auto Scaling policies and warm pools",
          "Data transfer and migration services"
        ]
      },
      {
        name: "Design Cost-Optimized Architectures", weight: 0.20, prefix: "cost",
        topics: [
          "S3 storage class selection",
          "Lifecycle policies and archival",
          "EBS snapshot and volume cost",
          "Compute pricing models",
          "Serverless vs container cost",
          "Environment scheduling and idle resources",
          "Right-sizing and cost visibility",
          "Data transfer and NAT cost",
          "Database cost optimization",
          "Cost allocation tags and budgets",
          "Elastic scaling to match demand"
        ]
      }
    ]
  },

  {
    id: "DVA-C02",
    short: "DVA",
    name: "Developer – Associate",
    phase: 1,
    order: 2,
    exam: { questions: 65, minutes: 130, pass: 720, min: 100, max: 1000 },
    domains: [
      {
        name: "Development with AWS Services", weight: 0.32, prefix: "dev",
        topics: [
          "Lambda event source mappings",
          "Lambda packaging and layers",
          "API Gateway integrations and stages",
          "DynamoDB query vs scan",
          "DynamoDB conditional writes",
          "DynamoDB streams and TTL",
          "S3 SDK operations and presigned URLs",
          "SQS and SNS messaging patterns",
          "Step Functions orchestration",
          "Idempotency and retries with backoff",
          "Application configuration and environment variables"
        ]
      },
      {
        name: "Security", weight: 0.26, prefix: "dsec",
        topics: [
          "Cognito user pools vs identity pools",
          "Token handling and JWT validation",
          "IAM roles for Lambda and ECS",
          "Least-privilege policy authoring",
          "KMS envelope encryption",
          "Secrets Manager and Parameter Store",
          "Encryption in transit and at rest",
          "Cross-origin and API authorization"
        ]
      },
      {
        name: "Deployment", weight: 0.24, prefix: "dep",
        topics: [
          "CloudFormation and SAM templates",
          "CodePipeline stages and artifacts",
          "CodeBuild buildspec",
          "Lambda traffic shifting with CodeDeploy",
          "Elastic Beanstalk deployment policies",
          "Container image builds and ECR",
          "Blue/green and canary strategies"
        ]
      },
      {
        name: "Troubleshooting and Optimization", weight: 0.18, prefix: "tro",
        topics: [
          "Lambda cold starts",
          "Lambda memory and timeout tuning",
          "Distributed tracing with X-Ray",
          "CloudWatch Logs Insights and metrics",
          "DynamoDB throttling and capacity",
          "API Gateway caching and throttling",
          "Error handling and dead-letter queues"
        ]
      }
    ]
  },

  {
    id: "SAP-C02",
    short: "SAP",
    name: "Solutions Architect – Professional",
    phase: 2,
    order: 3,
    exam: { questions: 75, minutes: 180, pass: 750, min: 100, max: 1000 },
    domains: [
      {
        name: "Design Solutions for Organizational Complexity", weight: 0.26, prefix: "org",
        topics: [
          "Multi-account strategy with Control Tower",
          "Organizations SCPs and guardrails",
          "Centralized identity and federation",
          "Network topology with Transit Gateway",
          "Hybrid connectivity and Direct Connect",
          "Cross-account resource sharing with RAM",
          "Centralized logging and audit",
          "Hybrid DNS design",
          "Cost allocation across accounts"
        ]
      },
      {
        name: "Design for New Solutions", weight: 0.29, prefix: "new",
        topics: [
          "Business continuity and RTO/RPO design",
          "Multi-Region resilience patterns",
          "Data store selection at scale",
          "Event-driven and streaming architectures",
          "Container platform selection",
          "Serverless at scale",
          "Caching and content delivery strategy",
          "Encryption and key management design",
          "Deployment and release strategy"
        ]
      },
      {
        name: "Continuous Improvement for Existing Solutions", weight: 0.25, prefix: "imp",
        topics: [
          "Performance bottleneck analysis",
          "Observability strategy",
          "Reliability improvements and fault isolation",
          "Cost optimization at scale",
          "Security posture remediation",
          "Operational automation",
          "Database engine tuning and scaling"
        ]
      },
      {
        name: "Accelerate Workload Migration and Modernization", weight: 0.20, prefix: "mig",
        topics: [
          "Migration strategy selection",
          "Discovery and portfolio assessment",
          "Database migration with DMS and SCT",
          "Large-scale data transfer",
          "Refactoring monoliths to microservices",
          "Mainframe and legacy modernization",
          "Cutover planning and rollback"
        ]
      }
    ]
  },

  {
    id: "DOP-C02",
    short: "DOP",
    name: "DevOps Engineer – Professional",
    phase: 2,
    order: 4,
    exam: { questions: 75, minutes: 180, pass: 750, min: 100, max: 1000 },
    domains: [
      {
        name: "SDLC Automation", weight: 0.22, prefix: "sdlc",
        topics: [
          "CodePipeline design",
          "CodeBuild and build optimization",
          "Deployment strategies",
          "Artifact management and versioning",
          "Automated testing in pipelines",
          "Multi-account pipeline deployment"
        ]
      },
      {
        name: "Configuration Management and IaC", weight: 0.17, prefix: "iac",
        topics: [
          "CloudFormation advanced templates",
          "StackSets across accounts",
          "CDK patterns",
          "Systems Manager automation",
          "Image pipelines with EC2 Image Builder",
          "Configuration drift detection"
        ]
      },
      {
        name: "Resilient Cloud Solutions", weight: 0.15, prefix: "rcs",
        topics: [
          "Multi-AZ and multi-Region deployment",
          "Auto Scaling and self-healing",
          "Backup and disaster recovery automation",
          "Fault tolerance for pipelines and workloads"
        ]
      },
      {
        name: "Monitoring and Logging", weight: 0.15, prefix: "mon",
        topics: [
          "CloudWatch metrics, alarms and dashboards",
          "Centralized logging architecture",
          "Log analysis with Logs Insights and OpenSearch",
          "Distributed tracing with X-Ray",
          "Synthetic and real-user monitoring"
        ]
      },
      {
        name: "Incident and Event Response", weight: 0.14, prefix: "inc",
        topics: [
          "EventBridge event routing",
          "Automated remediation with SSM and Lambda",
          "Incident response runbooks",
          "Health events and notifications",
          "Automatic rollback on failure"
        ]
      },
      {
        name: "Security and Compliance", weight: 0.17, prefix: "psec",
        topics: [
          "Automated compliance with Config rules",
          "Security Hub and GuardDuty automation",
          "Secrets and credential rotation",
          "Least-privilege automation and Access Analyzer",
          "Audit and evidence collection"
        ]
      }
    ]
  }
];
