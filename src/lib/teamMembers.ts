export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

// Edit this list to add, remove, or update team members.
export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tim',      name: 'Tim',      email: 'tim@projuice.co.uk'      },
  { id: 'hollie',   name: 'Hollie',   email: 'hollie@projuice.co.uk'   },
  { id: 'phoebe',   name: 'Phoebe',   email: 'phoebe@projuice.co.uk'   },
  { id: 'rachel',   name: 'Rachel',   email: 'rachel@projuice.co.uk'   },
  { id: 'kayleigh', name: 'Kayleigh', email: 'kayleigh@projuice.co.uk' },
];
