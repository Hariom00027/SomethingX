# Environment Setup

To run this application, you need to set up the following environment variables:

```bash
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

## Local Development Setup

1. Copy `application.properties.template` to `application.properties`:
   ```bash
   cp src/main/resources/application.properties.template src/main/resources/application.properties
   ```

2. Set up your environment variables:
   - For Windows PowerShell:
   ```powershell
   $env:GOOGLE_CLIENT_ID="your_client_id"
   $env:GOOGLE_CLIENT_SECRET="your_client_secret"
   $env:JWT_SECRET="your_jwt_secret"
   ```
   
   - For Linux/MacOS:
   ```bash
   export GOOGLE_CLIENT_ID="your_client_id"
   export GOOGLE_CLIENT_SECRET="your_client_secret"
   export JWT_SECRET="your_jwt_secret"
   ```

3. For Docker deployment, add these variables to your docker-compose environment section.

**Note:** Never commit sensitive credentials to version control. Keep them secure and use environment variables or secure secret management solutions in production.