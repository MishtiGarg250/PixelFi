import { Router } from "express";
import type { Request, Response } from "express";
import { sseManager } from "../utils/sseManager.js";
import prisma from "../lib/prisma.js"; // Ensure this matches your Prisma Client instance path

const router = Router();

/**
 * 1. Pull Endpoint (Historical Baseline)
 * GET /api/insights?userId=xyz
 */
router.get('/insights', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      res.status(400).json({ error: 'Missing required userId string parameter' });
      return;
    }

    // Pull the latest historical data rows for the baseline dashboard sync
    const insights = await prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.status(200).json(insights);
  } catch (error: any) {
    console.error('================ PRISMA CRASH DETAILS ===============');
  console.error(error); 
  console.error('=====================================================');
  
  res.status(500).json({ 
    error: 'Internal server error pulling insight data history.',
    meta: error?.message || 'No message string attached'
  });
  }
});

/**
 * 2. Push Endpoint (Unidirectional Stream)
 * GET /api/insights/stream?userId=xyz
 */
router.get('/insights/stream', (req: Request, res: Response): void => {
  const userId = req.query.userId as string | undefined;
  
  if (!userId) {
    res.status(400).json({ error: 'Missing required userId string parameter' });
    return;
  }

  // Establish strict Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform', // Added no-transform to block proxies from altering headers
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', 
  });

  // Safe optimization: Check if a compression library is active, flush headers out immediately
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  // Register this streaming handle into our singleton manager map
  sseManager.addClient(userId, res);
  console.log(`[SSE Connection] Dynamic stream opened for user context: ${userId}`);

  // Set a 30-second text comments ping to avoid connection timeouts across cloud routers
  const keepAliveInterval = setInterval(() => {
    res.write(': keepalive\n\n');
    
    // Explicitly flush compression middleware on every tick to guarantee chunk transport stability
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  }, 30000);

  // Safely clean up if the client navigates away or closes their app window
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseManager.removeClient(userId, res);
    console.log(`[SSE Connection] Stream severed cleanly for user context: ${userId}`);
    res.end();
  });
});

export default router;