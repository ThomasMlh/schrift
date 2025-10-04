// Script d'initialisation MongoDB pour Schrift
// À exécuter dans le shell MongoDB ou via MongoDB Atlas ("Data Explorer" > "Insert Document")

// Guildes
// use schrift;
db.guildes.insertMany([
  { _id: 1, name: "A" },
  { _id: 2, name: "B" },
  { _id: 3, name: "C" },
  { _id: 4, name: "D" }
]);

// Membres (exemple)
db.membres.insertMany([
  { _id: 1, name: "Roku", role: "chef", guilde_id: 1 },
  { _id: 2, name: "Bob", role: "membre", guilde_id: 1 },
  { _id: 3, name: "Eve", role: "sous-chef", guilde_id: 2 }
]);

// Rotations (exemple)
db.rotations.insertMany([
  { _id: 1, name: "Rotation 1", date: new Date() }
]);

// Scores (exemple)
db.scores.insertMany([
  { _id: 1, guilde_id: 1, score: 100 },
  { _id: 2, guilde_id: 2, score: 80 }
]);
