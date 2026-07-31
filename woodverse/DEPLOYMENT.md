# WoodVerse Deployment

## Vercel frontend

Create a Vercel project from this repository and set its Root Directory to `woodverse/apps/web`.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://woodverse-api.onrender.com`

`apps/web/vercel.json` keeps React routes working after a page refresh.

## Render services

The repository includes `/render.yaml` for the Express API and FastAPI AI service. Create the services from the blueprint and set these values after Render gives the service URLs:

```env
WEB_ORIGIN=https://your-frontend.vercel.app
AI_SERVICE_URL=https://your-ai-service.onrender.com
DATABASE_URL=your-postgresql-connection-string
DB_SSL=true
```

The API service runs from `woodverse/apps/api` with `npm ci` and `npm start`.

The AI service runs from `woodverse/apps/ai-service` with `pip install -r requirements.txt` and `uvicorn src.main:app --host 0.0.0.0 --port $PORT`.

## Supabase Storage

Create `product-images`, `room-images`, `vendor-documents`, and `supplier-documents` buckets. Keep product and room images public only when they are intended for marketplace display; keep registration documents private.
