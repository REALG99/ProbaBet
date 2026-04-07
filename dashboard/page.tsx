import { matches } from '../../data/matches';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return <DashboardClient fixtures={matches} />;
}
