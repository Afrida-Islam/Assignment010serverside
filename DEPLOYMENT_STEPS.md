# Deploying Your Node.js Application to Vercel

Here are the steps to deploy your project to Vercel using a GitHub repository.

### Step 1: Push Your Project to GitHub

1.  Go to [GitHub](https://github.com) and create a new repository.
2.  Follow the instructions on GitHub to push your local project folder (`G:\Project\Assingment010\server`) to the new repository. Make sure all your files, including `index.js`, `package.json`, and the corrected `vercel.json`, are pushed.

### Step 2: Import Your Project into Vercel

1.  Go to your [Vercel dashboard](https://vercel.com/dashboard).
2.  Click the "**Add New...**" button and select "**Project**".
3.  Under "**Import Git Repository**", find and select your new GitHub repository. Vercel will automatically detect that it is a Node.js project.

### Step 3: Configure Your Vercel Project

1.  **Framework Preset**: Vercel should automatically select **Other** or **Node.js**. This is correct.
2.  **Build and Output Settings**: You can leave these as they are. Vercel will use the `vercel.json` file for configuration, so no build command is needed.
3.  **Environment Variables**: This is a crucial step. Your `index.js` file uses `process.env.DB_USERNAME` and `process.env.DB_PASSWORD`. You must add these to your Vercel project:
    *   Expand the "**Environment Variables**" section.
    *   Add a variable with the name `DB_USERNAME` and its corresponding value from your `.env` file.
    *   Add another variable with the name `DB_PASSWORD` and its value.

### Step 4: Deploy

1.  Click the "**Deploy**" button.
2.  Vercel will now build and deploy your application. You can monitor the progress in the build logs.

Once the deployment is complete, you will be given a URL where your live application can be accessed.
