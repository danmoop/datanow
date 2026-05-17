export type AppUser = { id: string; email: string; isPremium: boolean }
export type AppEnv = { Variables: { user: AppUser } }
