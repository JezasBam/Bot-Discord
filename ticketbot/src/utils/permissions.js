import { loadConfig } from '../config/index.js';

const config = loadConfig();

export async function hasAdminRole(member) {
  if (!member) return false;
  
  const hasDiscordPerms = member.permissions.has('Administrator') || 
                         member.permissions.has('ManageGuild') ||
                         member.permissions.has('KickMembers') ||
                         member.permissions.has('BanMembers');
  
  if (hasDiscordPerms) return true;
  
  return member.roles.cache.some(role => 
    config.moderation.adminRoles.includes(role.name)
  );
}

export function getAdminRoles(guild) {
  return guild.roles.cache.filter(role => 
    config.moderation.adminRoles.includes(role.name) ||
    role.permissions.has('Administrator')
  );
}

export function canModerate(executor, target) {
  if (!executor || !target) return false;
  
  return executor.permissions.has('Administrator') ||
         executor.permissions.has('ManageGuild') ||
         (executor.roles.highest.position > target.roles.highest.position && 
          (executor.permissions.has('KickMembers') || executor.permissions.has('BanMembers')));
}
