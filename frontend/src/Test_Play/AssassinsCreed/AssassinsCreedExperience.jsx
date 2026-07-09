import React from 'react';
import QTE_AC from './QTE_AC';

export default function AssassinsCreedExperience({ onExit }) {
  // Uses the dedicated QTE script for Assassin's Creed
  return <QTE_AC onExit={onExit} />;
}
