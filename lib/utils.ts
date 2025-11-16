/**
 * Utility functions for the FIDE World Cup Stats application
 */

/**
 * Format player name from "Lastname, Firstname" to "Firstname Lastname"
 * @param name - Player name in "Lastname, Firstname" format
 * @returns Formatted name as "Firstname Lastname"
 */
export function formatPlayerName(name: string): string {
  if (!name) return '';

  // Check if name contains a comma (FIDE format: "Lastname, Firstname")
  if (name.includes(',')) {
    const [lastname, firstname] = name.split(',').map(s => s.trim());
    return `${firstname} ${lastname}`;
  }

  // If no comma, return as-is
  return name;
}

/**
 * Format player names for "Player1 vs Player2" display
 * @param white - White player name
 * @param black - Black player name
 * @returns Formatted string "White vs Black"
 */
export function formatPlayerVs(white: string, black: string): string {
  return `${formatPlayerName(white)} vs ${formatPlayerName(black)}`;
}

/**
 * Shorten player name to "F. Lastname" format
 * @param name - Full player name
 * @returns Shortened name (e.g., "Magnus Carlsen" -> "M. Carlsen")
 */
export function shortenPlayerName(name: string): string {
  const formatted = formatPlayerName(name);
  const parts = formatted.split(' ');

  if (parts.length < 2) return formatted;

  const firstname = parts[0];
  const lastname = parts.slice(1).join(' ');

  return `${firstname.charAt(0)}. ${lastname}`;
}
