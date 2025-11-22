// Static badge catalog. In future this could move to DB.
module.exports = [
  // Phase 1 foundational badges (auto-awarded)
  { code: 'signup', name: 'Signed Up', icon: '✅', image: '/badges/signup.svg', description: 'Completed account registration.' },
  { code: 'profile_complete', name: 'Profile Complete', icon: '📄', image: '/badges/profile_complete.svg', description: 'Created and completed profile basics.' },
  { code: 'first_project', name: 'First Project', icon: '🛠️', image: '/badges/first_project.svg', description: 'Created your first project.' },
  // Future / advanced badges (visible but locked until earned later phases)
  { code: 'leader', name: 'Leader', icon: '🏆', image: '/badges/leader.svg', description: 'Led a project team successfully.' },
  { code: 'innovator', name: 'Innovator', icon: '💡', image: '/badges/innovator.svg', description: 'Contributed a novel solution or idea.' },
  { code: 'team_player', name: 'Team Player', icon: '🤝', image: '/badges/team_player.svg', description: 'Collaborated effectively across teams.' },
  { code: 'problem_solver', name: 'Problem Solver', icon: '🧩', image: '/badges/problem_solver.svg', description: 'Solved a complex technical challenge.' },
  { code: 'achiever', name: 'Achiever', icon: '🎯', image: '/badges/achiever.svg', description: 'Met milestones with high quality.' },
  { code: 'mentor', name: 'Mentor', icon: '🧠', image: '/badges/mentor.svg', description: 'Guided and supported other members.' },
  { code: 'early_adopter', name: 'Early Adopter', icon: '🚀', image: '/badges/early_adopter.svg', description: 'Adopted new platform features quickly.' }
];
