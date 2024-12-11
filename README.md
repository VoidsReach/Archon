# Archon
Discord Integration Bot for Developer and Testing Integrations

## Deployment Information

Archon is deployed using **AWS ECS Fargate Spot** for efficient and scalable hosting. The infrastructure also leverages an **Application Load Balancer (ALB)** to route incoming traffic to ECS tasks.

### Overview of Services Used
1. **AWS ECS (Elastic Container Service)**:
   - Fargate Spot is used to minimize hosting costs.
   - Task definitions are configured to run the bot’s Docker container.
   
2. **Application Load Balancer (ALB)**:
   - Routes incoming traffic to the ECS tasks.
   - Listens on HTTP port `80` and forwards traffic to the container’s exposed port.

3. **Amazon ECR (Elastic Container Registry)**:
   - Stores the Docker images used by ECS.

4. **CloudWatch Logs**:
   - Captures application logs for monitoring and debugging.
