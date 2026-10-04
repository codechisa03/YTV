# Cloud Hosting Guide (Vercel & Render)

Since this IPTV app is completely static (HTML, CSS, JS), you can easily host it on the cloud for free. I have already created the necessary configuration files for you (`vercel.json` and `render.yaml`).

## Option 1: Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy this app. The `vercel.json` file in the root folder automatically tells Vercel to route traffic to your `webos-app` directory.

### Steps:
1. Push this entire project to a **GitHub repository**.
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
3. Click **Add New... > Project**.
4. Import your GitHub repository.
5. In the configuration screen, you can leave everything as default. (Do NOT change the Framework Preset or Build Command).
6. Click **Deploy**.
7. In a few seconds, Vercel will give you a live URL (e.g. `https://your-iptv-app.vercel.app`) where you can use the app from any browser!

---

## Option 2: Deploying to Render

Render is another great free static hosting option. The `render.yaml` Blueprint file is already configured for a Static Site pointing to the `webos-app` folder.

### Steps:
1. Push this entire project to a **GitHub repository**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
3. Click **New > Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and create the Static Site for you.
6. Click **Apply** to deploy.
7. Render will provide you with a `.onrender.com` URL when the deployment finishes.

### Alternative (Manual Render setup without Blueprint):
1. On Render, click **New > Static Site**.
2. Connect your repo.
3. Set **Build Command** to empty (clear it out).
4. Set **Publish directory** to `webos-app`.
5. Click **Create Static Site**.
