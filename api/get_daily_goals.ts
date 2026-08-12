import { Request, Response } from 'express';
import { generateDailyGoals } from '../logic/daily_goals_engine';

export default function getDailyGoalsHandler(req: Request, res: Response) {
  const method = req.method;
  const body = req.body || {};
  
  console.log(`[HANDLER] getDailyGoalsHandler [${method}] body:`, JSON.stringify(body));
  
  try {
    const performance = body.performance;
    const level = body.level || 'intermediate';
    const time_available = body.time_available || 10;
    
    const goals = generateDailyGoals(
      performance,
      level,
      time_available
    );
    
    console.log(`[HANDLER] Success. Generated ${goals.daily_goals.length} tasks.`);
    res.json(goals);
  } catch (error) {
    console.error("Error generating daily goals:", error);
    res.status(500).json({ error: "Failed to generate daily goals engine logic" });
  }
}
