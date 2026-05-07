# Calculators - Explication des Formules

Ces formules sont standard dans le domaine du fitness et de la nutrition et sont utilisées dans l'application FitMetrics.

## 1. One Rep Max (1RM)
Le "One Rep Max" est le poids maximum que tu pourrais soulever pour UNE SEULE répétition. Comme c'est dangereux de le tester en vrai tout le temps, on l'estime grâce à des formules lorsque l'on fait plusieurs répétitions avec un poids plus léger. C'est un indicateur clé de force.

*   **Formule d'Epley**: `Poids * (1 + (Répétitions / 30))`
    *   *Explication* : C'est la plus connue. Elle donne une très bonne estimation globale. Si tu fais 10 répétitions à 80kg, elle calcule que ton maximum serait de `80 * (1 + 10/30) = 106.6 kg`.
*   **Formule de Brzycki**: `Poids * (36 / (37 - Répétitions))`
    *   *Explication* : C'est une alternative très précise pour les séries de moins de 10 répétitions. Si tu fais ton calcul avec Brzycki pour 80kg à 10 reps, tu obtiens : `80 * (36 / 27) = 106.6 kg`. Les résultats différent souvent aux extrêmes.

## 2. BMR (Basal Metabolic Rate = Métabolisme de Base)
Le BMR représente l'énergie (les calories) que ton corps dépense au repos complet (pour respirer, faire battre le cœur, etc.) en l'espace de 24h.

*   **Formule de Mifflin-St Jeor**:
    *   *Explication* : Aujourd'hui considérée comme la plus précise pour le grand public. Elle prend en compte ton Poids, ta Taille, ton Âge et ton Sexe car ils influencent directement l'énergie nécessaire à ton corps.
*   **Formule de Harris-Benedict (Révisée)**:
    *   *Explication* : C'est la formule historique "classique". Plus ancienne, elle a tendance à légèrement surestimer les calories mais reste très utilisée dans de nombreuses applications.

## 3. TDEE (Total Daily Energy Expenditure = Dépense Énergétique Journalière Totale)
Le TDEE est le nombre "final" de calories dont ton corps a besoin en prenant en compte **ton activité physique**.

*   *Explication* : On prend d'abord ton **BMR** (vu juste au dessus) et on le multiplie par un "coefficient d'activité".
    *   Si tu es sédentaire (travail de bureau, pas ou peu de sport) on multiplie le BMR par 1.2
    *   Si tu es très actif (sport intense tous les jours) on le multiplie par exemple par 1.9
    *   Si ton TDEE est calculé à 2500 kcal, alors manger 2500 kcal te maintient à ton poids actuel. Manger moins te fait maigrir.
