#!/usr/bin/env python3
"""
Enhanced Fantasy Football Draft GUI
Features:
- Fixed player table that updates as players are drafted
- Better visual interface with colors and formatting
- Real-time updates of available players
- Clear draft progress tracking
"""

import pandas as pd
import numpy as np
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.live import Live
from rich.text import Text
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.columns import Columns
from rich.align import Align
import os
import time
from typing import List, Dict, Optional, Tuple

# Import existing modules
from models import DraftState, Team, LINEUP
from draft import load_players, load_espn_ranks, attach_espn_ranks_inplace, report_espn_match_coverage
from util import load_adp, attach_adp_inplace
from var import davar_esbn_deficit_weighted, remaining_var_budget_by_pos, accrued_var_by_pos
from demand import _pos_need_multipliers

# Initialize Rich console
console = Console()

# Data files
DATA = "data/player_rankings.csv"
ESPN = "data/espn_rankings_final.csv"
ADP = "data/ppr_adp_new.csv"

class DraftGUI:
    def __init__(self):
        self.df = None
        self.draft = None
        self.team_names = []
        self.user_team = 0
        self.console = Console()
        
    def load_data(self):
        """Load and prepare player data"""
        with self.console.status("[bold green]Loading player data...", spinner="dots"):
            self.df = load_players(DATA)
            
            # Load ESPN ranks
            try:
                espn = load_espn_ranks(ESPN)
                attach_espn_ranks_inplace(self.df, espn)
                report_espn_match_coverage(self.df)
            except Exception as e:
                self.console.print(f"[yellow]Warning: Could not load ESPN data: {e}[/yellow]")
            
            # Load ADP data
            adp = load_adp(ADP)
            attach_adp_inplace(self.df, adp)
            
        self.console.print("[bold green]✓[/bold green] Data loaded successfully!")
    
    def get_draft_config(self) -> Tuple[int, int]:
        """Get draft configuration from user"""
        self.console.print(Panel.fit("🏈 [bold blue]Fantasy Football Draft Setup[/bold blue] 🏈"))
        
        # Get number of teams
        while True:
            try:
                n_teams = int(Prompt.ask("Enter number of teams", default="12"))
                if 2 <= n_teams <= 16:
                    break
                else:
                    self.console.print("[red]Please enter a number between 2 and 16.[/red]")
            except ValueError:
                self.console.print("[red]Please enter a valid number.[/red]")
        
        # Get number of rounds
        while True:
            try:
                rounds = int(Prompt.ask("Enter number of rounds", default="15"))
                if 1 <= rounds <= 20:
                    break
                else:
                    self.console.print("[red]Please enter a number between 1 and 20.[/red]")
            except ValueError:
                self.console.print("[red]Please enter a valid number.[/red]")
        
        return n_teams, rounds
    
    def get_team_names(self, n_teams: int) -> List[str]:
        """Get team names from user"""
        self.console.print(Panel.fit(f"[bold]Enter {n_teams} team names in draft order (1st pick to last pick)[/bold]"))
        
        team_names = []
        for i in range(n_teams):
            while True:
                name = Prompt.ask(f"Team {i+1} (pick #{i+1})")
                if name.strip():
                    team_names.append(name.strip())
                    break
                self.console.print("[red]Please enter a valid team name.[/red]")
        
        return team_names
    
    def get_snake_draft_order(self, n_teams: int, rounds: int) -> List[int]:
        """Generate snake draft order"""
        draft_order = []
        for round_num in range(1, rounds + 1):
            if round_num % 2 == 1:  # Odd rounds: 1, 2, 3, ..., n
                round_order = list(range(n_teams))
            else:  # Even rounds: n, n-1, ..., 2, 1
                round_order = list(range(n_teams - 1, -1, -1))
            
            for team_idx in round_order:
                draft_order.append(team_idx)
        
        return draft_order
    
    def display_draft_order(self, team_names: List[str], draft_order: List[int]):
        """Display the complete draft order"""
        table = Table(title="📋 Complete Draft Order")
        table.add_column("Pick", style="cyan", no_wrap=True)
        table.add_column("Round", style="magenta")
        table.add_column("Team", style="green")
        
        for i, team_idx in enumerate(draft_order):
            round_num = (i // len(team_names)) + 1
            pick_in_round = (i % len(team_names)) + 1
            table.add_row(
                f"{i+1:2d}",
                f"{round_num:2d}.{pick_in_round:2d}",
                team_names[team_idx]
            )
        
        self.console.print(table)
    
    def select_user_team(self, team_names: List[str]) -> int:
        """Let user select their team"""
        self.console.print("\n[bold]Which team are you?[/bold]")
        
        for i, name in enumerate(team_names):
            self.console.print(f"{i+1}. {name}")
        
        while True:
            try:
                user_choice = int(Prompt.ask(f"Enter your team number (1-{len(team_names)})")) - 1
                if 0 <= user_choice < len(team_names):
                    return user_choice
                else:
                    self.console.print(f"[red]Please enter a number between 1 and {len(team_names)}[/red]")
            except ValueError:
                self.console.print("[red]Please enter a valid number[/red]")
    
    def create_player_table(self, available_players: pd.DataFrame, top_n: int = 20) -> Table:
        """Create a rich table of available players"""
        table = Table(title="📊 Available Players")
        table.add_column("Rank", style="cyan", no_wrap=True)
        table.add_column("Player", style="white")
        table.add_column("Pos", style="yellow")
        table.add_column("Team", style="blue")
        table.add_column("PPG", style="green")
        table.add_column("ESPN Rank", style="magenta")
        table.add_column("ADP", style="red")
        
        # Get top players by PPG
        top_players = available_players.nlargest(top_n, 'ppg')
        
        for i, (idx, player) in enumerate(top_players.iterrows(), 1):
            espn_rank = player.get('espn_rank', 'N/A')
            adp = player.get('adp', 'N/A')
            
            table.add_row(
                f"{i}",
                player['player_name'],
                player['position'],
                player.get('team', 'N/A'),
                f"{player['ppg']:.1f}",
                f"{espn_rank}" if pd.notna(espn_rank) else "N/A",
                f"{adp}" if pd.notna(adp) else "N/A"
            )
        
        return table
    
    def create_draft_status_panel(self) -> Panel:
        """Create a panel showing current draft status"""
        if not self.draft:
            return Panel("Draft not started")
        
        current_pick = self.draft.current_pick
        total_picks = self.draft.n_teams * self.draft.rounds
        progress = (current_pick - 1) / total_picks * 100
        
        round_num = (current_pick - 1) // self.draft.n_teams + 1
        pick_in_round = (current_pick - 1) % self.draft.n_teams + 1
        current_owner = self.draft.pick_owner(current_pick)
        current_owner_name = self.team_names[current_owner]
        
        content = f"""
[b]Pick {current_pick}/{total_picks}[/b] ({progress:.1f}%)
[b]Round {round_num}.{pick_in_round}[/b]
[b]Current: {current_owner_name}[/b]
[b]Available Players: {len(self.df) - len(self.draft.taken)}[/b]
        """
        
        return Panel(content, title="📈 Draft Progress", border_style="blue")
    
    def create_user_roster_panel(self) -> Panel:
        """Create a panel showing user's roster"""
        if not self.draft:
            return Panel("Draft not started")
        
        team = self.draft.teams[self.user_team]
        team_name = self.team_names[self.user_team]
        
        if not team.picks:
            return Panel("No picks yet", title=f"👤 {team_name}'s Roster", border_style="green")
        
        # Create roster table
        roster_table = Table(show_header=False, box=None)
        roster_table.add_column("Slot", style="cyan")
        roster_table.add_column("Player", style="white")
        roster_table.add_column("Pos", style="yellow")
        roster_table.add_column("PPG", style="green")
        
        # Add players to roster
        for i, player_idx in enumerate(team.picks):
            player = self.df.loc[player_idx]
            roster_table.add_row(
                f"{i+1}.",
                player['player_name'],
                player['position'],
                f"{player['ppg']:.1f}"
            )
        
        # Add remaining needs
        needs_text = "Needs: "
        for pos, need in team.need.items():
            if need > 0:
                needs_text += f"{pos}:{need} "
        
        content = f"{roster_table}\n\n[dim]{needs_text}[/dim]"
        return Panel(content, title=f"👤 {team_name}'s Roster", border_style="green")
    
    def find_player(self, query: str) -> List[int]:
        """Find players matching query"""
        matches = self.df[self.df['player_name'].str.lower().str.contains(query.lower())]
        return list(matches.index)
    
    def make_pick(self, pick_idx: int) -> bool:
        """Make a pick for the current team"""
        if not self.draft or self.draft.is_complete():
            return False
        
        current_owner = self.draft.pick_owner(self.draft.current_pick)
        pos = self.df.loc[pick_idx, 'position']
        
        # Validate roster need
        if not self.draft.teams[current_owner].can_draft(pos):
            self.console.print(f"[red]{self.team_names[current_owner]} cannot draft {pos} (slots full)[/red]")
            return False
        
        # Apply pick
        self.draft.taken.add(pick_idx)
        self.draft.teams[current_owner].picks.append(pick_idx)
        self.draft.teams[current_owner].add_player(pos)
        
        # Advance pick
        self.draft.current_pick += 1
        return True
    
    def run_draft(self):
        """Main draft loop with GUI"""
        # Load data
        self.load_data()
        
        # Get configuration
        n_teams, rounds = self.get_draft_config()
        self.team_names = self.get_team_names(n_teams)
        
        # Show draft order
        draft_order = self.get_snake_draft_order(n_teams, rounds)
        self.display_draft_order(self.team_names, draft_order)
        
        # Select user team
        self.user_team = self.select_user_team(self.team_names)
        
        # Initialize draft
        self.draft = DraftState(n_teams=n_teams, rounds=rounds, user_team_ix=self.user_team)
        
        # Main draft loop
        while not self.draft.is_complete():
            # Clear screen
            os.system('clear' if os.name == 'posix' else 'cls')
            
            # Get available players
            available_players = self.df[~self.df.index.isin(self.draft.taken)]
            
            # Create layout
            layout = Layout()
            layout.split_column(
                Layout(name="header", size=3),
                Layout(name="main", ratio=1),
                Layout(name="footer", size=10)
            )
            
            layout["main"].split_row(
                Layout(name="players", ratio=2),
                Layout(name="info", ratio=1)
            )
            
            # Header
            layout["header"].update(Panel.fit(
                f"🏈 [bold blue]Fantasy Football Draft - Pick {self.draft.current_pick}[/bold blue] 🏈",
                border_style="blue"
            ))
            
            # Player table
            player_table = self.create_player_table(available_players)
            layout["players"].update(player_table)
            
            # Info panels
            info_layout = Layout()
            info_layout.split_column(
                Layout(self.create_draft_status_panel()),
                Layout(self.create_user_roster_panel())
            )
            layout["info"].update(info_layout)
            
            # Footer with input
            current_owner = self.draft.pick_owner(self.draft.current_pick)
            current_owner_name = self.team_names[current_owner]
            
            footer_content = f"""
[b]Current Pick: {current_owner_name}[/b]

Commands:
- Enter player name to search and pick
- Enter 'auto' for auto-pick
- Enter 'quit' to exit
            """
            
            layout["footer"].update(Panel(footer_content, title="🎯 Make Pick", border_style="yellow"))
            
            # Display layout
            self.console.print(layout)
            
            # Get user input
            cmd = Prompt.ask(f"\n{current_owner_name}'s pick").strip()
            
            if cmd.lower() == 'quit':
                if Confirm.ask("Are you sure you want to quit?"):
                    break
                continue
            
            elif cmd.lower() == 'auto':
                # Simple auto-pick: take best available by PPG
                if available_players.empty:
                    self.console.print("[red]No players available![/red]")
                    continue
                
                best_player_idx = available_players['ppg'].idxmax()
                if self.make_pick(best_player_idx):
                    player_name = self.df.loc[best_player_idx, 'player_name']
                    self.console.print(f"[green]Auto-picked: {player_name}[/green]")
                    time.sleep(1)
            
            elif cmd.isdigit():
                # Pick by index
                try:
                    pick_idx = int(cmd)
                    if pick_idx in available_players.index:
                        if self.make_pick(pick_idx):
                            player_name = self.df.loc[pick_idx, 'player_name']
                            self.console.print(f"[green]Picked: {player_name}[/green]")
                            time.sleep(1)
                    else:
                        self.console.print("[red]Invalid player index[/red]")
                        time.sleep(1)
                except ValueError:
                    self.console.print("[red]Invalid number[/red]")
                    time.sleep(1)
            
            else:
                # Search by name
                matches = self.find_player(cmd)
                if not matches:
                    self.console.print("[red]No players found matching that name[/red]")
                    time.sleep(1)
                    continue
                
                if len(matches) == 1:
                    pick_idx = matches[0]
                    if self.make_pick(pick_idx):
                        player_name = self.df.loc[pick_idx, 'player_name']
                        self.console.print(f"[green]Picked: {player_name}[/green]")
                        time.sleep(1)
                else:
                    # Show matches
                    self.console.print(f"[yellow]Found {len(matches)} matches:[/yellow]")
                    for i, idx in enumerate(matches[:5], 1):
                        player = self.df.loc[idx]
                        self.console.print(f"{i}. {player['player_name']} ({player['position']}) - {player['ppg']:.1f} PPG")
                    
                    choice = Prompt.ask("Enter number to pick", choices=[str(i) for i in range(1, min(6, len(matches) + 1))])
                    pick_idx = matches[int(choice) - 1]
                    if self.make_pick(pick_idx):
                        player_name = self.df.loc[pick_idx, 'player_name']
                        self.console.print(f"[green]Picked: {player_name}[/green]")
                        time.sleep(1)
        
        # Draft complete
        self.show_final_rosters()
    
    def show_final_rosters(self):
        """Show final rosters for all teams"""
        self.console.print(Panel.fit("🏆 [bold green]Draft Complete![/bold green] 🏆"))
        
        for i, team_name in enumerate(self.team_names):
            team = self.draft.teams[i]
            
            if not team.picks:
                continue
            
            # Create roster table
            roster_table = Table(title=f"👤 {team_name}'s Final Roster")
            roster_table.add_column("Player", style="white")
            roster_table.add_column("Pos", style="yellow")
            roster_table.add_column("PPG", style="green")
            roster_table.add_column("Total PPG", style="bold green")
            
            total_ppg = 0
            for player_idx in team.picks:
                player = self.df.loc[player_idx]
                total_ppg += player['ppg']
                roster_table.add_row(
                    player['player_name'],
                    player['position'],
                    f"{player['ppg']:.1f}",
                    ""
                )
            
            roster_table.add_row("", "", "", f"{total_ppg:.1f}")
            self.console.print(roster_table)
            self.console.print()

if __name__ == "__main__":
    gui = DraftGUI()
    gui.run_draft()
