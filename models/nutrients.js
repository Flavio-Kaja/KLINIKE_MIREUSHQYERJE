const nutrients = [];

class Nutrient {
  constructor(name, calories, protein, carbs, fat) {
    this.name = name;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
  }
}

module.exports = {
  nutrients: nutrients,
  Nutrient: Nutrient,
};
