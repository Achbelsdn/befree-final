/**
 * Script pour créer le premier administrateur
 * ============================================
 * Usage: npx tsx scripts/create-admin.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       BéninFreelance - Création du Super Administrateur     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");

  // Vérifier la connexion à la base de données
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Erreur: DATABASE_URL non définie dans les variables d'environnement");
    console.log("   Créez un fichier .env avec DATABASE_URL=mysql://user:password@host:port/database");
    process.exit(1);
  }

  try {
    const db = drizzle(databaseUrl);
    console.log("✅ Connexion à la base de données établie");
    console.log("");

    // Demander les informations
    const name = await question("Nom complet: ");
    const email = await question("Email: ");
    const password = await question("Mot de passe (min 8 caractères): ");

    // Validation
    if (!name || name.length < 2) {
      console.error("❌ Le nom doit contenir au moins 2 caractères");
      process.exit(1);
    }

    if (!email || !email.includes("@")) {
      console.error("❌ Email invalide");
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error("❌ Le mot de passe doit contenir au moins 8 caractères");
      process.exit(1);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      console.log("");
      console.log("⚠️  Un utilisateur avec cet email existe déjà.");
      const update = await question("Voulez-vous le promouvoir en superadmin? (oui/non): ");
      
      if (update.toLowerCase() === "oui" || update.toLowerCase() === "o") {
        await db.update(users)
          .set({ role: "superadmin" })
          .where(eq(users.email, email));
        console.log("");
        console.log("✅ Utilisateur promu en superadmin avec succès!");
      } else {
        console.log("Opération annulée.");
      }
      process.exit(0);
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const openId = `admin-${nanoid(16)}`;
    
    await db.insert(users).values({
      openId,
      name,
      email,
      passwordHash,
      role: "superadmin",
      userType: "client",
      isSeller: false,
      emailVerified: true,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    });

    console.log("");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║              ✅ Super Administrateur créé!                  ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("📧 Email:", email);
    console.log("🔑 Mot de passe: [celui que vous avez entré]");
    console.log("👤 Rôle: superadmin");
    console.log("");
    console.log("Vous pouvez maintenant vous connecter sur /login");
    console.log("");

  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
