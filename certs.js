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
    id: "DVA-C02", parked: true,
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
    id: "SAP-C02", parked: true,
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
    id: "DOP-C02", parked: true,
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
  },

  {
    id: "AIF-C01", parked: true,
    short: "AIF",
    name: "AI Practitioner",
    phase: 2,
    order: 5,
    exam: { questions: 65, minutes: 90, pass: 700, min: 100, max: 1000 },
    domains: [
      { name: "Fundamentals of AI and ML", weight: 0.20, topics: [
        "AI, ML and deep learning terminology",
        "Types of machine learning and when each applies",
        "The machine learning lifecycle",
        "Data types and data quality for AI",
        "AWS AI and ML service landscape"
      ]},
      { name: "Fundamentals of Generative AI", weight: 0.24, topics: [
        "Foundation models and how they are trained",
        "Tokens, embeddings and context windows",
        "Prompt engineering basics",
        "Generative AI use cases and limitations",
        "Amazon Bedrock and Amazon Q overview"
      ]},
      { name: "Applications of Foundation Models", weight: 0.28, topics: [
        "Selecting a foundation model for a use case",
        "Retrieval Augmented Generation and knowledge bases",
        "Fine-tuning versus prompt engineering versus RAG",
        "Agents and tool use",
        "Evaluating foundation model outputs",
        "Inference parameters and their effects"
      ]},
      { name: "Guidelines for Responsible AI", weight: 0.14, topics: [
        "Bias, fairness and inclusivity",
        "Transparency and explainability",
        "Hallucination and its mitigations",
        "Responsible dataset selection",
        "Amazon Bedrock Guardrails"
      ]},
      { name: "Security, Compliance and Governance for AI Solutions", weight: 0.14, topics: [
        "Securing AI systems and data",
        "IAM and access control for AI services",
        "Data governance and lineage",
        "Regulatory and compliance considerations",
        "Monitoring and auditing AI workloads"
      ]}
    ]
  },

  {
    id: "MLA-C01", parked: true,
    short: "MLA",
    name: "Machine Learning Engineer – Associate",
    phase: 2,
    order: 6,
    exam: { questions: 65, minutes: 130, pass: 720, min: 100, max: 1000 },
    domains: [
      { name: "Data Preparation for Machine Learning", weight: 0.28, topics: [
        "Ingesting and storing training data",
        "Data formats and partitioning for ML",
        "Feature engineering and transformation",
        "Handling missing, imbalanced and noisy data",
        "SageMaker Feature Store and Data Wrangler",
        "Data labelling with SageMaker Ground Truth"
      ]},
      { name: "ML Model Development", weight: 0.26, topics: [
        "Choosing an algorithm or pretrained model",
        "Training jobs and distributed training",
        "Hyperparameter tuning strategies",
        "Overfitting, underfitting and regularisation",
        "Evaluation metrics for classification and regression",
        "Experiment tracking and model registry"
      ]},
      { name: "Deployment and Orchestration of ML Workflows", weight: 0.22, topics: [
        "Real-time, serverless, asynchronous and batch inference",
        "Endpoint autoscaling and instance selection",
        "SageMaker Pipelines and workflow orchestration",
        "Infrastructure as code for ML environments",
        "CI/CD for machine learning"
      ]},
      { name: "ML Solution Monitoring, Maintenance and Security", weight: 0.24, topics: [
        "Data and model drift detection",
        "SageMaker Model Monitor and Clarify",
        "Cost optimisation for training and inference",
        "IAM, VPC and encryption for ML workloads",
        "Logging, metrics and troubleshooting"
      ]}
    ]
  },

  {
    id: "SOA-C03", parked: true,
    short: "CloudOps",
    name: "CloudOps Engineer – Associate",
    phase: 3,
    order: 7,
    /* VERIFY: domain weights carried over from the SOA-C02 blueprint.
     * Confirm against the SOA-C03 exam guide before writing questions. */
    exam: { questions: 65, minutes: 130, pass: 720, min: 100, max: 1000 },
    domains: [
      { name: "Monitoring, Logging, Analysis and Remediation", weight: 0.22, topics: [
        "CloudWatch metrics, alarms and dashboards",
        "CloudWatch Logs and Logs Insights",
        "CloudTrail and AWS Config for operational insight",
        "Automated remediation with EventBridge and Systems Manager",
        "Troubleshooting workload health"
      ]},
      { name: "Reliability and Business Continuity", weight: 0.22, topics: [
        "Scaling and load balancing operations",
        "Backup, restore and lifecycle policies",
        "Multi-AZ and multi-Region operational patterns",
        "Disaster recovery testing and runbooks"
      ]},
      { name: "Deployment, Provisioning and Automation", weight: 0.22, topics: [
        "CloudFormation stacks, drift and change sets",
        "Systems Manager automation and patching",
        "AMI and image lifecycle management",
        "Provisioning repeatable environments"
      ]},
      { name: "Security and Compliance", weight: 0.16, topics: [
        "IAM operations and least privilege",
        "Secrets and certificate rotation",
        "Compliance reporting and audit evidence",
        "Data protection and encryption operations"
      ]},
      { name: "Networking and Content Delivery", weight: 0.18, topics: [
        "VPC connectivity troubleshooting",
        "DNS and Route 53 operations",
        "Content delivery and edge configuration",
        "Hybrid connectivity operations"
      ]}
    ]
  },

  {
    id: "TF-003", parked: true,
    short: "Terraform",
    name: "HashiCorp Terraform Associate (003)",
    phase: 3,
    order: 8,
    /* VERIFY: HashiCorp publishes objectives without percentage weights.
     * Weights here are even across the nine objectives — adjust if the
     * exam guide is updated with real ones. */
    exam: { questions: 57, minutes: 60, pass: 700, min: 0, max: 1000 },
    domains: [
      { name: "Infrastructure as Code Concepts", weight: 0.11, topics: [
        "What infrastructure as code is and why it matters",
        "Advantages of IaC patterns"
      ]},
      { name: "Terraform's Purpose", weight: 0.11, topics: [
        "Multi-cloud and provider-agnostic benefits",
        "Terraform state and its purpose"
      ]},
      { name: "Terraform Basics", weight: 0.11, topics: [
        "Installing and versioning providers",
        "Provider requirements and configuration",
        "Terraform plugin architecture"
      ]},
      { name: "Terraform Outside Core Workflow", weight: 0.11, topics: [
        "terraform import",
        "State manipulation commands",
        "Debugging and TF_LOG"
      ]},
      { name: "Interact with Terraform Modules", weight: 0.11, topics: [
        "Module sources and versions",
        "Module inputs and outputs",
        "Public and private module registries"
      ]},
      { name: "Core Terraform Workflow", weight: 0.11, topics: [
        "Write, plan and apply",
        "terraform fmt and validate",
        "Destroy and targeted operations"
      ]},
      { name: "Implement and Maintain State", weight: 0.11, topics: [
        "Local and remote backends",
        "State locking and consistency",
        "Sensitive data in state",
        "Workspaces"
      ]},
      { name: "Read, Generate and Modify Configuration", weight: 0.12, topics: [
        "Variables, locals and outputs",
        "Data sources",
        "Resource dependencies and lifecycle",
        "Built-in functions and expressions",
        "Dynamic blocks, count and for_each"
      ]},
      { name: "HCP Terraform Capabilities", weight: 0.11, topics: [
        "Remote state and remote operations",
        "Workspaces and VCS-driven runs",
        "Private registry and policy enforcement"
      ]}
    ]
  },

  {
    id: "NCA-AIIO", parked: true,
    short: "NVIDIA AIIO",
    name: "NVIDIA AI Infrastructure and Operations",
    phase: 3,
    order: 9,
    /* VERIFY: NVIDIA publishes the format but not a scaled pass score.
     * Question count, duration and weights should be confirmed against the
     * current exam page before writing questions. */
    exam: { questions: 50, minutes: 60, pass: 700, min: 0, max: 1000 },
    domains: [
      { name: "AI, Machine Learning and Deep Learning Essentials", weight: 0.30, topics: [
        "AI, ML and deep learning distinctions",
        "Training versus inference workloads",
        "Neural network fundamentals",
        "Common AI use cases in the enterprise",
        "The NVIDIA software stack for AI"
      ]},
      { name: "AI Infrastructure", weight: 0.40, topics: [
        "GPU architecture and selection",
        "Multi-GPU and multi-node scaling",
        "NVLink, NVSwitch and interconnect topology",
        "Networking for AI: InfiniBand and RoCE",
        "Storage and data pipelines for AI workloads",
        "DGX systems and reference architectures",
        "Energy, cooling and data centre considerations"
      ]},
      { name: "AI Operations", weight: 0.30, topics: [
        "Cluster orchestration with Kubernetes and Slurm",
        "GPU monitoring and telemetry with DCGM",
        "Virtualisation and multi-instance GPU",
        "NGC containers and model deployment",
        "Troubleshooting GPU and fabric issues",
        "Capacity planning and job scheduling"
      ]}
    ]
  }
];
