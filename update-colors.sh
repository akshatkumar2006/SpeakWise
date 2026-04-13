#!/bin/bash

# SpeakWise Color Scheme Update Script
# This script updates all color references in the project to match the new professional color scheme

echo "🎨 Starting SpeakWise Color Scheme Update..."
echo "This will update colors across all JSX and CSS files"
echo ""

# Navigate to client directory
cd "$(dirname "$0")/client/src" || exit 1

# Create backup
echo "📦 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="../../color_backup_$timestamp"
mkdir -p "$backup_dir"
find . -name "*.jsx" -o -name "*.css" | while read -r file; do
  mkdir -p "$backup_dir/$(dirname "$file")"
  cp "$file" "$backup_dir/$file"
done
echo "✅ Backup created at: $backup_dir"
echo ""

# Function to update files
update_colors() {
  local file=$1
  
  # Purple variants → Violet/Teal/Indigo
  sed -i '' 's/purple-50/[#EEF2FF]/g' "$file"
  sed -i '' 's/purple-100/[#6C63FF]\/10/g' "$file"
  sed -i '' 's/purple-200/[#6C63FF]\/20/g' "$file"
  sed -i '' 's/purple-300/[#6C63FF]\/30/g' "$file"
  sed -i '' 's/purple-400/[#6C63FF]/g' "$file"
  sed -i '' 's/purple-500/[#6C63FF]/g' "$file"
  sed -i '' 's/purple-600/[#6C63FF]/g' "$file"
  sed -i '' 's/purple-700/[#5A52E8]/g' "$file"
  sed -i '' 's/purple-800/[#4A42D8]/g' "$file"
  sed -i '' 's/purple-900/[#2A3A7A]/g' "$file"
  
  # Violet variants → Violet
  sed -i '' 's/violet-50/[#EEF2FF]/g' "$file"
  sed -i '' 's/violet-100/[#6C63FF]\/10/g' "$file"
  sed -i '' 's/violet-200/[#6C63FF]\/20/g' "$file"
  sed -i '' 's/violet-300/[#6C63FF]\/30/g' "$file"
  sed -i '' 's/violet-400/[#6C63FF]/g' "$file"
  sed -i '' 's/violet-500/[#6C63FF]/g' "$file"
  sed -i '' 's/violet-600/[#6C63FF]/g' "$file"
  sed -i '' 's/violet-700/[#5A52E8]/g' "$file"
  sed -i '' 's/violet-800/[#4A42D8]/g' "$file"
  
  # Indigo variants → Deep Indigo (for brand/structural elements)
  sed -i '' 's/indigo-50/[#EEF2FF]/g' "$file"
  sed -i '' 's/indigo-100/[#1E2A5A]\/10/g' "$file"
  sed -i '' 's/indigo-200/[#1E2A5A]\/20/g' "$file"
  sed -i '' 's/indigo-300/[#1E2A5A]\/30/g' "$file"
  sed -i '' 's/indigo-400/[#2A3A7A]/g' "$file"
  sed -i '' 's/indigo-500/[#2A3A7A]/g' "$file"
  sed -i '' 's/indigo-600/[#1E2A5A]/g' "$file"
  sed -i '' 's/indigo-700/[#2A3A7A]/g' "$file"
  sed -i '' 's/indigo-800/[#1E2A5A]/g' "$file"
  sed -i '' 's/indigo-900/[#1E2A5A]/g' "$file"
  
  # Blue variants (context-dependent - using Deep Indigo for primary, Teal for accents)
  # Background blues → Off-white/Light blue
  sed -i '' 's/from-blue-50/from-[#F8FAFF]/g' "$file"
  sed -i '' 's/to-blue-50/to-[#F8FAFF]/g' "$file"
  sed -i '' 's/via-blue-50/via-[#F8FAFF]/g' "$file"
  sed -i '' 's/bg-blue-50/bg-[#F8FAFF]/g' "$file"
  sed -i '' 's/from-blue-100/from-[#EEF2FF]/g' "$file"
  sed -i '' 's/to-blue-100/to-[#EEF2FF]/g' "$file"
  sed -i '' 's/bg-blue-100/bg-[#EEF2FF]/g' "$file"
  
  # Primary button blues → Teal (unless they're clearly structural/indigo context)
  # This requires manual review, but we'll default to Teal for action buttons
  sed -i '' 's/bg-blue-500/bg-[#1FB6A6]/g' "$file"
  sed -i '' 's/bg-blue-600/bg-[#1E2A5A]/g' "$file"
  sed -i '' 's/bg-blue-700/bg-[#2A3A7A]/g' "$file"
  sed -i '' 's/from-blue-500/from-[#1E2A5A]/g' "$file"
  sed -i '' 's/to-blue-600/to-[#2A3A7A]/g' "$file"
  sed -i '' 's/from-blue-600/from-[#1E2A5A]/g' "$file"
  sed -i '' 's/to-blue-700/to-[#2A3A7A]/g' "$file"
  sed -i '' 's/hover:from-blue-500/hover:from-[#17A293]/g' "$file"
  sed -i '' 's/hover:to-blue-600/hover:to-[#1FB6A6]/g' "$file"
  
  # Text blues → Muted blue-gray or Deep Indigo
  sed -i '' 's/text-blue-500/text-[#1FB6A6]/g' "$file"
  sed -i '' 's/text-blue-600/text-[#1E2A5A]/g' "$file"
  sed -i '' 's/text-blue-700/text-[#2A3A7A]/g' "$file"
  
  # Border blues → Light section backgrounds
  sed -i '' 's/border-blue-200/border-[#EEF2FF]/g' "$file"
  sed -i '' 's/border-blue-600/border-[#1E2A5A]/g' "$file"
  
  # Primary color references (from tailwind config)
  # These should become Teal for CTAs, Indigo for brand
  sed -i '' 's/from-primary-50/from-[#F8FAFF]/g' "$file"
  sed -i '' 's/to-primary-50/to-[#F8FAFF]/g' "$file"
  sed -i '' 's/bg-primary-50/bg-[#F8FAFF]/g' "$file"
  sed -i '' 's/from-primary-400/from-[#1FB6A6]/g' "$file"
  sed -i '' 's/to-primary-600/to-[#17A293]/g' "$file"
  sed -i '' 's/from-primary-500/from-[#1FB6A6]/g' "$file"
  sed -i '' 's/to-primary-600/to-[#1FB6A6]/g' "$file"
  sed -i '' 's/via-primary-500/via-[#1FB6A6]/g' "$file"
  sed -i '' 's/from-primary-600/from-[#1FB6A6]/g' "$file"
  sed -i '' 's/to-primary-700/to-[#17A293]/g' "$file"
  sed -i '' 's/hover:from-primary-600/hover:from-[#17A293]/g' "$file"
  sed -i '' 's/hover:to-primary-700/hover:to-[#17A293]/g' "$file"
  sed -i '' 's/hover:from-primary-700/hover:from-[#17A293]/g' "$file"
  sed -i '' 's/bg-primary-600/bg-[#1FB6A6]/g' "$file"
  sed -i '' 's/bg-primary-500/bg-[#1FB6A6]/g' "$file"
  sed -i '' 's/text-primary-600/text-[#1FB6A6]/g' "$file"
  sed -i '' 's/border-primary-600/border-[#1FB6A6]/g' "$file"
  
  # Fix duplicate [#...] patterns that might occur
  sed -i '' 's/\[\[#/[#/g' "$file"
  sed -i '' 's/#\]\]/#]/g' "$file"
}

echo "🔄 Updating color references..."
file_count=0

# Update all JSX files
find . -name "*.jsx" | while read -r file; do
  update_colors "$file"
  ((file_count++))
  echo "  Updated: $file"
done

# Update CSS files
find . -name "*.css" | while read -r file; do
  update_colors "$file"
  ((file_count++))
  echo "  Updated: $file"
done

echo ""
echo "✅ Color update complete!"
echo "📊 Files processed: Check the output above"
echo ""
echo "⚠️  IMPORTANT: Please review the changes!"
echo "   - Some context-specific colors may need manual adjustment"
echo "   - Semantic colors (success/error/warning) were preserved"
echo "   - Check components that mix multiple color contexts"
echo ""
echo "🔍 To review changes:"
echo "   git diff client/src"
echo ""
echo "♻️  To restore from backup:"
echo "   cp -r $backup_dir/* client/src/"
echo ""
echo "📖 See COLOR_SCHEME_GUIDE.md for color usage guidelines"
