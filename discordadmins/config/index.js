export const DISCORD_ADMINS_CONFIG = {
  commands: {
    mute: {
      name: 'Mute User',
      description: 'Mutează un utilizator pentru o perioadă configurabilă',
      defaultDuration: 5, // minute
      maxDuration: 60 // minute maxim
    },
    ban: {
      name: 'Ban User',
      description: 'Dă ban permanent unui utilizator',
      deleteMessageDays: 0 // zile de mesaje de șters
    },
    kick: {
      name: 'Kick User',
      description: 'Dă kick unui utilizator (se poate reconecta)'
    }
  },
  permissions: {
    requiredRoles: ['Admin', 'Moderator', 'Staff'],
    requiredPermissions: ['Administrator', 'ManageGuild', 'KickMembers', 'BanMembers'],
    bypassRoleHierarchy: false // dacă adminii pot acționa pe utilizatori cu roluri superioare
  },
  logging: {
    enabled: true,
    logChannel: 'mod-logs',
    logActions: ['mute', 'ban', 'kick'],
    logFormat: 'embed' // 'embed' sau 'text'
  },
  features: {
    autoUnmute: true,
    dmNotification: true, // notifică utilizatorul prin DM
    appealSystem: false // sistem de apel
  }
};

export function getDiscordAdminsConfig() {
  return DISCORD_ADMINS_CONFIG;
}
