**Creating a New PostgreSQL Database on DigitalOcean:**

1. **Log in to DigitalOcean**
   - Go to [DigitalOcean Control Panel](https://cloud.digitalocean.com/login)
   - Sign in with your account credentials

2. **Create a New Database**
   - Click on **Databases** in the left sidebar
   - Click the **Create Database Cluster** button
   - Select **PostgreSQL** as the database engine

3. **Choose Configuration**
   - Select a plan (e.g., **Basic** or **Professional**)
   - Choose resources (e.g., **Regular CPU, 1 vCPU, 1GB RAM** for development)
   - Select a data center region (e.g., **New York**)
   - Give your database a name (e.g., **saas-starter-db**)
   - Click **Create Database Cluster**

4. **Get Connection Details**
   - Wait for the database to be provisioned (usually takes a few minutes)
   - Once created, click on your new database from the list
   - Under the **Connection Details** section, find the connection string
   - Select **Connection parameters** and copy the **Connection string**
   - This string will look something like: `postgresql://doadmin:password@db-postgresql-nyc1-12345.db.ondigitalocean.com:25060/defaultdb?sslmode=require`

5. **Configure Firewall (Optional)**
   - If you need to restrict access, click on **Settings** and then **Trusted Sources**
   - Add the IP addresses that should have access to your database

> **Note:** The smallest database size (1GB RAM) is sufficient for development and testing. For production, consider using at least 2GB RAM depending on your expected load.