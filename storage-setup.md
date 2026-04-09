# Storage Bucket Setup for Resume Uploads

## Manual Setup (Supabase Dashboard)

1. Go to your Supabase Dashboard → Storage
2. Click "New Bucket"
3. Create a bucket named: `career-applications`
4. Set it as **Public** bucket (so resumes can be accessed via URL)
5. Click "Create"

## Bucket Policies (Supabase Dashboard)

After creating the bucket, add these policies:

### Upload Policy (for public applicants)
- **Name**: Allow public uploads
- **Allowed operations**: INSERT
- **Target**: career-applications
- **Policy definition**: `true`

### Read Policy (for viewing resumes)
- **Name**: Allow public read
- **Allowed operations**: SELECT
- **Target**: career-applications
- **Policy definition**: `true`

### Delete Policy (for admin cleanup)
- **Name**: Allow admin delete
- **Allowed operations**: DELETE
- **Target**: career-applications
- **Policy definition**: `auth.jwt() ->> 'role' = 'admin'`

## OR: Use Supabase CLI / API

```bash
# Create the bucket
supabase storage create career-applications --public

# Create policies
supabase storage policy create career-applications insert --definition 'true'
supabase storage policy create career-applications select --definition 'true'
supabase storage policy create career-applications delete --definition "(auth.jwt() ->> 'role') = 'admin'"
```

## File Restrictions

In the bucket settings, restrict file types:
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Max file size**: 5MB

This matches the validation in `careers-actions.ts`.
