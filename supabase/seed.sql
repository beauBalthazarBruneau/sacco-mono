-- Seed data for fantasy football draft assistant
-- This file contains sample player data for testing

-- Insert sample player rankings (Top 50 players for 2024)
INSERT INTO player_rankings (player_name, position, team, rank, tier, adp, ppr_points, standard_points, half_ppr_points, injury_status, news) VALUES
-- Top Tier RBs
('Christian McCaffrey', 'RB', 'SF', 1, 'Tier 1', 1.2, 320.5, 280.3, 300.4, 'Healthy', 'Elite RB1, high volume expected'),
('Bijan Robinson', 'RB', 'ATL', 2, 'Tier 1', 2.1, 310.2, 270.1, 290.2, 'Healthy', 'Sophomore breakout candidate'),
('Saquon Barkley', 'RB', 'PHI', 3, 'Tier 1', 3.5, 305.8, 265.4, 285.6, 'Healthy', 'New team, high expectations'),
('Jonathan Taylor', 'RB', 'IND', 4, 'Tier 1', 4.2, 300.1, 260.8, 280.5, 'Healthy', 'Contract resolved, full workload'),
('Jahmyr Gibbs', 'RB', 'DET', 5, 'Tier 1', 5.8, 295.3, 255.6, 275.5, 'Healthy', 'Year 2 breakout potential'),

-- Top Tier WRs
('Tyreek Hill', 'WR', 'MIA', 6, 'Tier 1', 6.1, 325.4, 285.2, 305.3, 'Healthy', 'Speed demon, Tua connection'),
('CeeDee Lamb', 'WR', 'DAL', 7, 'Tier 1', 7.3, 320.1, 280.5, 300.3, 'Healthy', 'Dak Prescott favorite target'),
('Amon-Ra St. Brown', 'WR', 'DET', 8, 'Tier 1', 8.5, 315.8, 275.9, 295.9, 'Healthy', 'Consistent PPR machine'),
('Ja''Marr Chase', 'WR', 'CIN', 9, 'Tier 1', 9.2, 310.2, 270.8, 290.5, 'Healthy', 'Burrow connection elite'),
('Garrett Wilson', 'WR', 'NYJ', 10, 'Tier 1', 10.1, 305.6, 265.4, 285.5, 'Healthy', 'Rodgers upgrade expected'),

-- Second Tier RBs
('Derrick Henry', 'RB', 'BAL', 11, 'Tier 2', 11.5, 290.2, 250.8, 270.5, 'Healthy', 'New team, still powerful'),
('Travis Etienne Jr.', 'RB', 'JAX', 12, 'Tier 2', 12.8, 285.4, 245.6, 265.5, 'Healthy', 'Lead back in JAX'),
('Rachaad White', 'RB', 'TB', 13, 'Tier 2', 13.2, 280.1, 240.3, 260.2, 'Healthy', 'Clear RB1 in TB'),
('James Cook', 'RB', 'BUF', 14, 'Tier 2', 14.5, 275.8, 235.9, 255.9, 'Healthy', 'Passing game involvement'),
('De''Von Achane', 'RB', 'MIA', 15, 'Tier 2', 15.1, 270.3, 230.5, 250.4, 'Healthy', 'Explosive playmaker'),

-- Second Tier WRs
('Puka Nacua', 'WR', 'LAR', 16, 'Tier 2', 16.3, 300.2, 260.8, 280.5, 'Healthy', 'Stafford connection strong'),
('DeVonta Smith', 'WR', 'PHI', 17, 'Tier 2', 17.8, 295.6, 255.9, 275.8, 'Healthy', 'Hurts favorite target'),
('DJ Moore', 'WR', 'CHI', 18, 'Tier 2', 18.2, 290.1, 250.4, 270.3, 'Healthy', 'Caleb Williams upgrade'),
('Chris Olave', 'WR', 'NO', 19, 'Tier 2', 19.5, 285.8, 245.6, 265.7, 'Healthy', 'Carr connection improving'),
('Drake London', 'WR', 'ATL', 20, 'Tier 2', 20.1, 280.3, 240.5, 260.4, 'Healthy', 'Penix Jr. upgrade'),

-- Top Tier QBs
('Josh Allen', 'QB', 'BUF', 21, 'Tier 1', 21.8, 380.5, 340.2, 360.4, 'Healthy', 'Dual threat elite QB'),
('Jalen Hurts', 'QB', 'PHI', 22, 'Tier 1', 22.3, 375.2, 335.8, 355.5, 'Healthy', 'Rushing upside elite'),
('Patrick Mahomes', 'QB', 'KC', 23, 'Tier 1', 23.1, 370.8, 330.5, 350.7, 'Healthy', 'Always elite, new weapons'),
('Lamar Jackson', 'QB', 'BAL', 24, 'Tier 1', 24.5, 365.4, 325.1, 345.3, 'Healthy', 'Rushing QB gold standard'),
('Caleb Williams', 'QB', 'CHI', 25, 'Tier 1', 25.2, 360.1, 320.8, 340.5, 'Healthy', 'Rookie with elite weapons'),

-- Third Tier RBs
('Alvin Kamara', 'RB', 'NO', 26, 'Tier 3', 26.8, 265.4, 225.6, 245.5, 'Healthy', 'PPR machine, consistent'),
('Joe Mixon', 'RB', 'HOU', 27, 'Tier 3', 27.3, 260.1, 220.3, 240.2, 'Healthy', 'New team, lead back role'),
('Aaron Jones', 'RB', 'MIN', 28, 'Tier 3', 28.5, 255.8, 215.9, 235.9, 'Healthy', 'Cousins upgrade expected'),
('Zamir White', 'RB', 'LV', 29, 'Tier 3', 29.1, 250.3, 210.5, 230.4, 'Healthy', 'Lead back in LV'),
('Tyler Allgeier', 'RB', 'ATL', 30, 'Tier 3', 30.2, 245.6, 205.8, 225.7, 'Healthy', 'Robinson handcuff'),

-- Third Tier WRs
('Jaylen Waddle', 'WR', 'MIA', 31, 'Tier 3', 31.5, 275.2, 235.8, 255.5, 'Healthy', 'Hill''s running mate'),
('Tee Higgins', 'WR', 'CIN', 32, 'Tier 3', 32.8, 270.6, 230.9, 250.8, 'Healthy', 'Chase''s complement'),
('Brandon Aiyuk', 'WR', 'SF', 33, 'Tier 3', 33.2, 265.1, 225.4, 245.3, 'Healthy', 'Purdy favorite target'),
('Nico Collins', 'WR', 'HOU', 34, 'Tier 3', 34.5, 260.8, 220.6, 240.7, 'Healthy', 'Stroud connection strong'),
('Rashee Rice', 'WR', 'KC', 35, 'Tier 3', 35.1, 255.3, 215.5, 235.4, 'Healthy', 'Mahomes new favorite'),

-- Top Tier TEs
('Sam LaPorta', 'TE', 'DET', 36, 'Tier 1', 36.8, 220.5, 180.2, 200.4, 'Healthy', 'Goff favorite target'),
('Travis Kelce', 'TE', 'KC', 37, 'Tier 1', 37.3, 215.2, 175.8, 195.5, 'Healthy', 'Mahomes connection elite'),
('Trey McBride', 'TE', 'ARI', 38, 'Tier 1', 38.5, 210.8, 170.5, 190.7, 'Healthy', 'Murray favorite target'),
('Evan Engram', 'TE', 'JAX', 39, 'Tier 1', 39.1, 205.4, 165.1, 185.3, 'Healthy', 'Lawrence connection strong'),
('Jake Ferguson', 'TE', 'DAL', 40, 'Tier 1', 40.2, 200.1, 160.8, 180.5, 'Healthy', 'Dak Prescott favorite'),

-- Fourth Tier RBs
('Kenneth Walker III', 'RB', 'SEA', 41, 'Tier 4', 41.5, 240.4, 200.6, 220.5, 'Healthy', 'Lead back in SEA'),
('Javonte Williams', 'RB', 'DEN', 42, 'Tier 4', 42.8, 235.1, 195.3, 215.2, 'Healthy', 'Year 2 breakout potential'),
('Brian Robinson Jr.', 'RB', 'WAS', 43, 'Tier 4', 43.2, 230.8, 190.9, 210.9, 'Healthy', 'Lead back in WAS'),
('Chuba Hubbard', 'RB', 'CAR', 44, 'Tier 4', 44.5, 225.3, 185.5, 205.4, 'Healthy', 'Lead back in CAR'),
('Tyjae Spears', 'RB', 'TEN', 45, 'Tier 4', 45.1, 220.6, 180.8, 200.7, 'Healthy', 'Henry replacement'),

-- Fourth Tier WRs
('Christian Kirk', 'WR', 'JAX', 46, 'Tier 4', 46.8, 250.2, 210.8, 230.5, 'Healthy', 'Lawrence favorite target'),
('Jerry Jeudy', 'WR', 'CLE', 47, 'Tier 4', 47.3, 245.6, 205.9, 225.8, 'Healthy', 'Watson upgrade expected'),
('Courtland Sutton', 'WR', 'DEN', 48, 'Tier 4', 48.5, 240.1, 200.4, 220.3, 'Healthy', 'Wilson connection improving'),
('Gabe Davis', 'WR', 'JAX', 49, 'Tier 4', 49.1, 235.8, 195.6, 215.7, 'Healthy', 'Lawrence deep threat'),
('Josh Downs', 'WR', 'IND', 50, 'Tier 4', 50.2, 230.3, 190.5, 210.4, 'Healthy', 'Richardson favorite target');

-- Insert sample player stats (2023 season data)
INSERT INTO player_stats (player_name, position, team, season, games_played, passing_yards, passing_tds, passing_ints, rushing_yards, rushing_tds, receiving_yards, receiving_tds, receptions, fantasy_points_ppr, fantasy_points_standard, fantasy_points_half_ppr) VALUES
-- Sample QB stats
('Josh Allen', 'QB', 'BUF', 2023, 17, 4306, 35, 14, 762, 15, 0, 0, 0, 380.5, 340.2, 360.4),
('Jalen Hurts', 'QB', 'PHI', 2023, 16, 3858, 23, 6, 605, 15, 0, 0, 0, 375.2, 335.8, 355.5),
('Patrick Mahomes', 'QB', 'KC', 2023, 16, 4183, 31, 14, 389, 5, 0, 0, 0, 370.8, 330.5, 350.7),
('Lamar Jackson', 'QB', 'BAL', 2023, 16, 3678, 24, 7, 821, 5, 0, 0, 0, 365.4, 325.1, 345.3),

-- Sample RB stats
('Christian McCaffrey', 'RB', 'SF', 2023, 17, 0, 0, 0, 1459, 14, 564, 7, 67, 320.5, 280.3, 300.4),
('Bijan Robinson', 'RB', 'ATL', 2023, 17, 0, 0, 0, 976, 4, 487, 4, 58, 310.2, 270.1, 290.2),
('Saquon Barkley', 'RB', 'NYG', 2023, 14, 0, 0, 0, 962, 6, 280, 4, 41, 305.8, 265.4, 285.6),
('Jonathan Taylor', 'RB', 'IND', 2023, 10, 0, 0, 0, 741, 7, 153, 1, 19, 300.1, 260.8, 280.5),
('Jahmyr Gibbs', 'RB', 'DET', 2023, 15, 0, 0, 0, 945, 10, 316, 1, 52, 295.3, 255.6, 275.5),

-- Sample WR stats
('Tyreek Hill', 'WR', 'MIA', 2023, 16, 0, 0, 0, 0, 0, 1799, 13, 119, 325.4, 285.2, 305.3),
('CeeDee Lamb', 'WR', 'DAL', 2023, 17, 0, 0, 0, 113, 0, 1749, 12, 135, 320.1, 280.5, 300.3),
('Amon-Ra St. Brown', 'WR', 'DET', 2023, 16, 0, 0, 0, 0, 0, 1515, 10, 119, 315.8, 275.9, 295.9),
('Ja''Marr Chase', 'WR', 'CIN', 2023, 16, 0, 0, 0, 0, 0, 1216, 7, 100, 310.2, 270.8, 290.5),
('Garrett Wilson', 'WR', 'NYJ', 2023, 17, 0, 0, 0, 0, 0, 1042, 3, 95, 305.6, 265.4, 285.5),

-- Sample TE stats
('Sam LaPorta', 'TE', 'DET', 2023, 17, 0, 0, 0, 0, 0, 889, 10, 86, 220.5, 180.2, 200.4),
('Travis Kelce', 'TE', 'KC', 2023, 15, 0, 0, 0, 0, 0, 984, 5, 93, 215.2, 175.8, 195.5),
('Trey McBride', 'TE', 'ARI', 2023, 17, 0, 0, 0, 0, 0, 825, 3, 81, 210.8, 170.5, 190.7),
('Evan Engram', 'TE', 'JAX', 2023, 17, 0, 0, 0, 0, 0, 963, 4, 114, 205.4, 165.1, 185.3),
('Jake Ferguson', 'TE', 'DAL', 2023, 17, 0, 0, 0, 0, 0, 761, 5, 71, 200.1, 160.8, 180.5);
