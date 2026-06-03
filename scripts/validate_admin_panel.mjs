import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(ROOT, ".env");

if (!existsSync(envPath)) {
  console.error("Error: .env file not found.");
  process.exit(1);
}

const envFile = readFileSync(envPath, "utf8");
const vars = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/"/g, "").replace(/'/g, "");
    vars[key] = val;
  }
});

const url = vars.SUPABASE_URL || vars.VITE_SUPABASE_URL;
const key = vars.SUPABASE_PUBLISHABLE_KEY || vars.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Error: Supabase URL or Key not found in .env.");
  process.exit(1);
}

const supabase = createClient(url, key);

// 1x1 pixel transparent PNG buffer for image uploads
const mockImageBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

async function runValidation() {
  const report = {
    login: { passed: false, details: "" },
    createArtist: { passed: false, details: "" },
    editArtist: { passed: false, details: "" },
    uploadArtistImage: { passed: false, details: "" },
    createRelease: { passed: false, details: "" },
    uploadReleaseCover: { passed: false, details: "" },
    verifyProductionLive: { passed: false, details: "" },
    verifyPersistedSupabase: { passed: false, details: "" },
    deleteArtist: { passed: false, details: "" }
  };

  const testStamp = Date.now();
  const artistName = `Test Rapper ${testStamp}`;
  const releaseTitle = `Test Hit ${testStamp}`;
  let artistId = null;
  let originalReleases = [];

  try {
    // -------------------------------------------------------------
    // 1. Admin Login
    // -------------------------------------------------------------
    console.log("=== 1. Testing Admin Login ===");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "armyking1428@gmail.com",
      password: "4*nk%Dw6$KkwBp"
    });

    if (authError) {
      report.login.details = `Login failed: ${authError.message}`;
      throw new Error(`Login failed: ${authError.message}`);
    }

    report.login.passed = true;
    report.login.details = `Login successful as ${authData.user.email} (UUID: ${authData.user.id})`;
    console.log("✅ Admin login successful!");

    // -------------------------------------------------------------
    // 2. Create Artist
    // -------------------------------------------------------------
    console.log("\n=== 2. Testing Create Artist ===");
    const { data: createdArtist, error: createError } = await supabase
      .from("artists")
      .insert({
        name: artistName,
        role: "Test Flagship",
        tag: "TST",
        bio: "This is a temporary validation test biography.",
        published: true,
        sort_order: 99
      })
      .select()
      .single();

    if (createError) {
      report.createArtist.details = `Create failed: ${createError.message}`;
      throw new Error(`Create failed: ${createError.message}`);
    }

    artistId = createdArtist.id;
    report.createArtist.passed = true;
    report.createArtist.details = `Successfully created artist "${artistName}" with ID ${artistId}`;
    console.log(`✅ Create artist successful! ID: ${artistId}`);

    // -------------------------------------------------------------
    // 3. Upload Artist Image
    // -------------------------------------------------------------
    console.log("\n=== 3. Testing Upload Artist Image ===");
    const artistImagePath = `artists/validation-${testStamp}.jpg`;
    const { data: artistUpload, error: artistUploadError } = await supabase.storage
      .from("media")
      .upload(artistImagePath, mockImageBuffer, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (artistUploadError) {
      report.uploadArtistImage.details = `Upload failed: ${artistUploadError.message}`;
      throw new Error(`Upload failed: ${artistUploadError.message}`);
    }

    const artistImageUrl = `${url}/storage/v1/object/public/media/${artistImagePath}`;
    report.uploadArtistImage.passed = true;
    report.uploadArtistImage.details = `Uploaded image to bucket path: ${artistImagePath}. Public URL: ${artistImageUrl}`;
    console.log(`✅ Upload artist image successful! Public URL: ${artistImageUrl}`);

    // -------------------------------------------------------------
    // 4. Edit Artist
    // -------------------------------------------------------------
    console.log("\n=== 4. Testing Edit Artist ===");
    const { data: editedArtist, error: editError } = await supabase
      .from("artists")
      .update({
        bio: "This is an updated validation test biography.",
        image_url: artistImageUrl
      })
      .eq("id", artistId)
      .select()
      .single();

    if (editError) {
      report.editArtist.details = `Edit failed: ${editError.message}`;
      throw new Error(`Edit failed: ${editError.message}`);
    }

    report.editArtist.passed = true;
    report.editArtist.details = `Updated biography and assigned image_url to "${artistImageUrl}"`;
    console.log("✅ Edit artist successful!");

    // -------------------------------------------------------------
    // 5. Upload Release Cover
    // -------------------------------------------------------------
    console.log("\n=== 5. Testing Upload Release Cover ===");
    const releaseCoverPath = `releases/validation-cover-${testStamp}.jpg`;
    const { data: releaseUpload, error: releaseUploadError } = await supabase.storage
      .from("media")
      .upload(releaseCoverPath, mockImageBuffer, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (releaseUploadError) {
      report.uploadReleaseCover.details = `Upload cover failed: ${releaseUploadError.message}`;
      throw new Error(`Upload cover failed: ${releaseUploadError.message}`);
    }

    const releaseCoverUrl = `${url}/storage/v1/object/public/media/${releaseCoverPath}`;
    report.uploadReleaseCover.passed = true;
    report.uploadReleaseCover.details = `Uploaded cover image to bucket path: ${releaseCoverPath}. Public URL: ${releaseCoverUrl}`;
    console.log(`✅ Upload release cover successful! Public URL: ${releaseCoverUrl}`);

    // -------------------------------------------------------------
    // 6. Create Release
    // -------------------------------------------------------------
    console.log("\n=== 6. Testing Create Release ===");
    const { data: settingsData, error: settingsError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "releases")
      .maybeSingle();

    if (settingsError) {
      report.createRelease.details = `Failed to retrieve current releases list: ${settingsError.message}`;
      throw new Error(`Failed to retrieve releases list: ${settingsError.message}`);
    }

    originalReleases = settingsData?.value || [];
    const newRelease = {
      id: `validation-release-${testStamp}`,
      title: releaseTitle,
      artist: artistName,
      cover_url: releaseCoverUrl,
      release_date: "2026-06-03",
      format: "Single",
      genre: "Trap",
      description: "Validation test release details.",
      spotify_url: "https://open.spotify.com",
      apple_url: "https://music.apple.com"
    };

    const updatedReleases = [...originalReleases, newRelease];

    const { error: upsertError } = await supabase
      .from("site_settings")
      .upsert({
        key: "releases",
        value: updatedReleases
      }, { onConflict: "key" });

    if (upsertError) {
      report.createRelease.details = `Failed to save release to site_settings: ${upsertError.message}`;
      throw new Error(`Failed to save release: ${upsertError.message}`);
    }

    report.createRelease.passed = true;
    report.createRelease.details = `Appended and saved release "${releaseTitle}" to site_settings (releases list count: ${updatedReleases.length})`;
    console.log(`✅ Create release successful!`);

    // -------------------------------------------------------------
    // 7. Verify Data is Persisted in Supabase
    // -------------------------------------------------------------
    console.log("\n=== 7. Verifying Data is Persisted in Supabase ===");
    const { data: dbArtist, error: fetchArtistError } = await supabase
      .from("artists")
      .select("*")
      .eq("id", artistId)
      .single();

    const { data: dbSettings, error: fetchSettingsError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "releases")
      .single();

    const inSettings = (dbSettings?.value || []).some(r => r.id === newRelease.id);

    if (fetchArtistError || fetchSettingsError || !dbArtist || !inSettings) {
      report.verifyPersistedSupabase.details = `Verification failed. Artist found: ${!!dbArtist}, Release found: ${inSettings}`;
    } else {
      report.verifyPersistedSupabase.passed = true;
      report.verifyPersistedSupabase.details = `Verified artist "${dbArtist.name}" and release ID "${newRelease.id}" exist directly in Supabase database tables.`;
      console.log("✅ Data persistence verified successfully in Supabase tables!");
    }

    // -------------------------------------------------------------
    // 8. Verify Changes Appear on Live Production Website
    // -------------------------------------------------------------
    console.log("\n=== 8. Verifying Changes Appear on Live Production Website ===");
    // Wait 5 seconds to let the edge cache flush or revalidate
    console.log("Waiting 5 seconds for edge caching / revalidation...");
    await new Promise(r => setTimeout(r, 5000));

    try {
      const res = await fetch("https://thenew1017records.vercel.app");
      const html = await res.text();
      
      const artistFound = html.includes(artistName);
      const releaseFound = html.includes(releaseTitle);

      if (artistFound && releaseFound) {
        report.verifyProductionLive.passed = true;
        report.verifyProductionLive.details = `Found new artist "${artistName}" and new release "${releaseTitle}" successfully in the server-rendered HTML of the live production website!`;
        console.log("✅ Changes verified successfully on the live production site!");
      } else {
        report.verifyProductionLive.details = `HTML loaded but did not contain the new artist (found: ${artistFound}) or new release (found: ${releaseFound}).`;
        console.warn("⚠️ Changes not found on live site. (Cache may be stale, or SSR loader serves from cache)");
      }
    } catch (fetchErr) {
      report.verifyProductionLive.details = `Failed to fetch live production website: ${fetchErr.message}`;
    }

  } catch (err) {
    console.error("\n❌ CRITICAL CRASH DURING VALIDATION TESTS:", err.message);
  } finally {
    // -------------------------------------------------------------
    // 9. Clean Up & Delete Artist/Release/Storage Assets
    // -------------------------------------------------------------
    console.log("\n=== 9. Cleaning up test data & Storage Assets ===");
    
    // Remove test artist
    if (artistId) {
      console.log(`Deleting test artist with ID ${artistId}...`);
      const { error: delError } = await supabase.from("artists").delete().eq("id", artistId);
      if (delError) {
        report.deleteArtist.details = `Delete artist error: ${delError.message}`;
      } else {
        report.deleteArtist.passed = true;
        console.log("✅ Deleted test artist from 'artists' table.");
      }
    }

    // Restore original releases list
    console.log("Restoring original releases list in site_settings...");
    const { error: restoreError } = await supabase
      .from("site_settings")
      .upsert({
        key: "releases",
        value: originalReleases
      }, { onConflict: "key" });

    if (restoreError) {
      console.error("Failed to restore releases list:", restoreError.message);
    } else {
      console.log("✅ Restored original releases list successfully.");
    }

    // Remove uploaded files
    console.log("Deleting storage mock assets from media bucket...");
    const filesToDelete = [
      `artists/validation-${testStamp}.jpg`,
      `releases/validation-cover-${testStamp}.jpg`
    ];
    const { error: storageDelError } = await supabase.storage.from("media").remove(filesToDelete);
    
    if (storageDelError) {
      console.error("Failed to delete storage mock assets:", storageDelError.message);
      report.deleteArtist.details += ` | Storage cleanup error: ${storageDelError.message}`;
    } else {
      console.log("✅ Storage cleanup completed successfully.");
      if (report.deleteArtist.passed) {
        report.deleteArtist.details = "Deleted test artist record from database and cleaned up uploaded storage assets.";
      }
    }
  }

  // -------------------------------------------------------------
  // Generate Final Report
  // -------------------------------------------------------------
  console.log("\n========================================================");
  console.log("                ADMIN VALIDATION REPORT                 ");
  console.log("========================================================");
  
  Object.entries(report).forEach(([key, result]) => {
    const status = result.passed ? "PASS" : "FAIL";
    console.log(`[${status}] - ${key.toUpperCase()}`);
    console.log(`       Details: ${result.details}`);
  });
  console.log("========================================================");
}

runValidation();
