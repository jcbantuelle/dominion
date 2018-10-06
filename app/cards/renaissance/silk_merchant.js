SilkMerchant = class SilkMerchant extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 4
    }

    play(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(2)

        game.turn.buys += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
    }

    gain_or_trash_event(player) {
        if (player.game.turn.possessed) {
            possessing_player_cards = PlayerCardsModel.findOne(player.game._id, player.game.turn.possessed._id)
            possessing_player_cards.coin_tokens += 1
            possessing_player_cards.villagers += 1
            player.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes a coin token and a villager`)
            PlayerCardsModel.update(player.game._id, possessing_player_cards)
        } else {
            player.player_cards.coin_tokens += 1
            player.player_cards.villagers += 1
            player.game.log.push(`&nbsp;&nbsp;<strong>${player.player_cards.username}</strong> takes a coin token and a villager`)
        }
    }

    gain_event(buyer) {
        this.gain_or_trash_event(buyer)
    }

    trash_event(trasher) {
        this.gain_or_trash_event(trasher)
    }
}
