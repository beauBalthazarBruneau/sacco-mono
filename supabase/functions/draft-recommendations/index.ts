import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import the TypeScript algorithm modules
import { generateRecommendations, type Player, type DraftState } from "../_shared/algorithm/draft.ts"
import { DraftState as DraftStateClass } from "../_shared/algorithm/models.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  players?: Player[]
  draftState?: {
    nTeams: number
    rounds: number
    userTeamIndex: number
    currentPick: number
    taken: number[]
    teams: Array<{
      picks: number[]
      roster: Record<string, number>
    }>
  }
  horizon?: number
  topN?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const requestBody: RequestBody = await req.json()
    const { players, draftState, horizon = 5, topN = 20 } = requestBody

    if (!players || !draftState) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: players and draftState are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Convert players array to Map
    const playersMap = new Map<number, Player>()
    players.forEach((player, index) => {
      playersMap.set(index, player)
    })

    // Reconstruct DraftState from the request
    const draftStateObj = new DraftStateClass(
      draftState.nTeams,
      draftState.rounds,
      draftState.userTeamIndex
    )
    draftStateObj.currentPick = draftState.currentPick
    draftStateObj.taken = new Set(draftState.taken)
    
    // Reconstruct teams
    draftState.teams.forEach((teamData, index) => {
      draftStateObj.teams[index].picks = teamData.picks
      draftStateObj.teams[index].roster = { ...teamData.roster }
    })

    // Generate recommendations using the new TypeScript algorithm
    const recommendations = generateRecommendations(
      playersMap,
      draftStateObj,
      horizon,
      topN
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: recommendations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in draft-recommendations function:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
