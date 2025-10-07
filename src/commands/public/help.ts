import { AmethystCommand, log4js } from "amethystjs";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default new AmethystCommand({
    name: 'aide',
    description: "Affiche la page d'aide",
    aliases: ['help', 'commands', 'commandes'],
    options: [
        {
            name: 'commande',
            description: "Voir l'aide d'une commande en particuler",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ]
}).setMessageRun(async({ message, client, options }) => {
    const commandName = options.first?.toLowerCase?.();
    if (commandName) {
        const cmd = client.messageCommands.find(x => x.options.name === commandName || x.options.aliases?.includes?.(commandName))

        if (cmd) {
            const displayOptions = (cmd: AmethystCommand) => {
                if (!cmd.options.options?.length) return `La syntaxe de la commande est la suivante : \`${client.configs.prefix}${cmd.options.name}\``;

                return `La syntaxe de la commande est la suivante : \`${client.configs.prefix}${cmd.options.name} ${cmd.options.options.map(x => (x as { required?: boolean} ).required ? `<${x.name}>` : `[${x.name}]`).join(' ')}\`\n\n💡\n> Les arguments entre \`<>\` sont **obligatoires** tandis que ceux entre \`[]\` sont **facultatifs**.`
            }
            
            const embed = new EmbedBuilder()
                .setTitle(`Aide - ${cmd.options.name}`)
                .setTimestamp(new Date())
                .setColor(message.author.accentColor ?? 'Orange')
                .setDescription(`${cmd.options.description}\n${displayOptions(cmd)}`)
                .addFields(
                    {
                        name: 'Cooldown',
                        value: `\`${cmd.options.cooldown ?? client.configs.defaultCooldownTime}\` secondes`,
                        inline: true
                    }
                )
                .setFooter({
                    text: message.author.username,
                    iconURL: message.author.displayAvatarURL()
                })
            
            if (cmd.options.aliases?.length > 0) {
                embed.addFields({
                    name: 'Alias',
                    value: cmd.options.aliases.map(x => `\`${x}\``).join(', '),
                    inline: false
                })
            }

            return message.reply({
                embeds: [embed]
            }).catch(log4js.trace);
        }
    }

    const embed = new EmbedBuilder()
        .setTitle("Page d'aide")
        .setColor(message.author.accentColor ?? 'Orange')
        .setTimestamp()
        .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL()
        })
        .setDescription(`Voici la liste des commandes disponibles :\n\n${client.messageCommands.sort((a, b) => a.options.name.localeCompare(b.options.name)).map(x => `- \`${x.options.name}\` : ${x.options.description}`).join('\n')}`)
        .setFields(
            {
                name: '💡 Commande en particuler',
                value: `Pour obtenir plus d'informations sur une commande en particuler, utilisez \`${client.configs.prefix}aide <nom de la commande>\``,
                inline: false
            }
        )
        .setColor('Orange')
    
    message.reply({
        embeds: [embed]
    }).catch(log4js.trace);
})