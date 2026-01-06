#!/usr/bin/env python3
"""
Script pour générer les favicons de différentes tailles à partir du logo.
"""
from PIL import Image
import os

# Chemin du logo source
logo_path = 'public/logo.png'
output_dir = 'public'

# Tailles à générer
sizes = {
    'favicon-16x16.png': (16, 16),
    'favicon-32x32.png': (32, 32),
    'apple-touch-icon.png': (180, 180),
    'android-chrome-192x192.png': (192, 192),
    'android-chrome-512x512.png': (512, 512),
}

print('🎨 Génération des favicons...\n')

try:
    # Ouvrir le logo source
    logo = Image.open(logo_path)
    print(f'✓ Logo chargé: {logo_path} ({logo.size[0]}x{logo.size[1]})')
    
    # Générer chaque taille
    for filename, size in sizes.items():
        output_path = os.path.join(output_dir, filename)
        
        # Redimensionner avec antialiasing de haute qualité
        resized = logo.resize(size, Image.Resampling.LANCZOS)
        
        # Sauvegarder
        resized.save(output_path, 'PNG', optimize=True)
        print(f'✓ Créé: {filename} ({size[0]}x{size[1]})')
    
    # Générer aussi le favicon.ico (16x16 et 32x32)
    favicon_path = os.path.join(output_dir, 'favicon.ico')
    icon_sizes = [(16, 16), (32, 32), (48, 48)]
    icons = [logo.resize(size, Image.Resampling.LANCZOS) for size in icon_sizes]
    icons[0].save(favicon_path, format='ICO', sizes=icon_sizes)
    print(f'✓ Créé: favicon.ico (multi-tailles)')
    
    print('\n✨ Tous les favicons ont été générés avec succès!')
    
except Exception as e:
    print(f'❌ Erreur: {e}')
    exit(1)
