from PIL import Image
import os
import sys

def process_image(img, max_width, max_height):
    """Convert color mode and resize if needed. Returns (img, resized, orig_w, orig_h)."""
    original_w, original_h = img.size

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    if original_w > max_width or original_h > max_height:
        img.thumbnail((max_width, max_height), Image.LANCZOS)
        resized = True
    else:
        resized = False

    return img, resized, original_w, original_h


def save_webp(img, output_path, quality):
    """Save image as compressed WebP."""
    img.save(
        output_path,
        "WEBP",
        quality=quality,
        method=6,       # 0 (fast) – 6 (best compression)
        optimize=True
    )


def compress_and_convert(
    folder_path,
    quality=70,
    max_width=1920,
    max_height=1080,
    delete_jpg_originals=True,
    recompress_webp=True
):
    """
    1. Convert JPG/JPEG → WebP (compressed + resized)
    2. Re-compress existing WebP images in-place

    Args:
        folder_path         : Folder containing images
        quality             : WebP quality 1-100 (70 recommended)
        max_width           : Max width before resizing
        max_height          : Max height before resizing
        delete_jpg_originals: Delete source JPG/JPEG after conversion
        recompress_webp     : Re-compress existing .webp files
    """
    if not os.path.isdir(folder_path):
        print(f"❌ Error: '{folder_path}' is not a valid folder.")
        sys.exit(1)

    all_files  = os.listdir(folder_path)
    jpg_files  = [f for f in all_files if f.lower().endswith(('.jpg', '.jpeg'))]
    webp_files = [f for f in all_files if f.lower().endswith('.webp')]

    print(f"📁 Folder        : {folder_path}")
    print(f"✨ Quality       : {quality}  |  Max: {max_width}x{max_height}")
    print(f"🖼️  JPG/JPEG      : {len(jpg_files)} file(s)")
    print(f"🌐 Existing WebP : {len(webp_files)} file(s)")
    print("=" * 55)

    success = failed = 0
    total_original = total_final = 0

    # ── STEP 1: Convert JPG/JPEG → WebP ──────────────────────────
    if jpg_files:
        print("\n📌 Converting JPG/JPEG → WebP ...\n")

    for filename in jpg_files:
        input_path  = os.path.join(folder_path, filename)
        output_name = os.path.splitext(filename)[0] + ".webp"
        output_path = os.path.join(folder_path, output_name)

        try:
            with Image.open(input_path) as img:
                img, resized, orig_w, orig_h = process_image(img, max_width, max_height)
                save_webp(img, output_path, quality)
                new_w, new_h = img.size

            orig_kb  = os.path.getsize(input_path)  / 1024
            final_kb = os.path.getsize(output_path) / 1024
            saved    = orig_kb - final_kb
            pct      = (saved / orig_kb * 100) if orig_kb else 0

            total_original += orig_kb
            total_final    += final_kb

            resize_note = f" | {orig_w}x{orig_h} → {new_w}x{new_h}" if resized else ""
            print(f"  ✅ {filename}{resize_note}")
            print(f"     {orig_kb:.1f} KB → {final_kb:.1f} KB  (saved {saved:.1f} KB / {pct:.1f}%)")

            if delete_jpg_originals:
                os.remove(input_path)
                print(f"     🗑️  Original JPG deleted")

            success += 1

        except Exception as e:
            print(f"  ❌ Failed: {filename} — {e}")
            failed += 1

    # ── STEP 2: Re-compress existing WebP ────────────────────────
    if recompress_webp and webp_files:
        print(f"\n📌 Re-compressing existing WebP files ...\n")

        for filename in webp_files:
            filepath = os.path.join(folder_path, filename)
            tmp_path = filepath + ".tmp.webp"

            try:
                orig_kb = os.path.getsize(filepath) / 1024

                with Image.open(filepath) as img:
                    img, resized, orig_w, orig_h = process_image(img, max_width, max_height)
                    save_webp(img, tmp_path, quality)
                    new_w, new_h = img.size

                final_kb = os.path.getsize(tmp_path) / 1024
                saved    = orig_kb - final_kb
                pct      = (saved / orig_kb * 100) if orig_kb else 0

                total_original += orig_kb
                total_final    += final_kb

                # Replace original with compressed version
                os.replace(tmp_path, filepath)

                resize_note = f" | {orig_w}x{orig_h} → {new_w}x{new_h}" if resized else ""
                print(f"  ✅ {filename}{resize_note}")
                print(f"     {orig_kb:.1f} KB → {final_kb:.1f} KB  (saved {saved:.1f} KB / {pct:.1f}%)")

                success += 1

            except Exception as e:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
                print(f"  ❌ Failed: {filename} — {e}")
                failed += 1

    # ── Summary ───────────────────────────────────────────────────
    total_saved = total_original - total_final
    total_pct   = (total_saved / total_original * 100) if total_original else 0

    print("\n" + "=" * 55)
    print(f"🎉 Done!  Converted/Compressed: {success}  |  Failed: {failed}")
    print(f"💾 Total saved: {total_saved:.1f} KB  ({total_pct:.1f}%)"
          f"  [{total_original:.1f} KB → {total_final:.1f} KB]")


if __name__ == "__main__":
    # ── CONFIGURE THESE ──────────────────────────────────────────
    FOLDER_PATH          = r"H:\Project Work\JNRCHAYAN.github.io\images\photographe"  # <-- your folder path
    QUALITY              = 70     # Lower = smaller file (60–80 recommended)
    MAX_WIDTH            = 1920   # Resize if image is wider than this
    MAX_HEIGHT           = 1080   # Resize if image is taller than this
    DELETE_JPG_ORIGINALS = True   # ✅ Delete original JPG/JPEG after conversion
    RECOMPRESS_WEBP      = True   # ✅ Re-compress existing WebP files
    # ─────────────────────────────────────────────────────────────

    compress_and_convert(
        FOLDER_PATH,
        QUALITY,
        MAX_WIDTH,
        MAX_HEIGHT,
        DELETE_JPG_ORIGINALS,
        RECOMPRESS_WEBP
    )