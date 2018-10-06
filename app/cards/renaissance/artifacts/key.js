Key = class Key extends State {

    start_turn_event(game, player_cards) {
        let gained_coins = CoinGainer.gain(game, player_cards, 1)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(this, true)}`)
    }
}
