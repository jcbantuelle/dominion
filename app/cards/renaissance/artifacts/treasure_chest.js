TreasureChest = class TreasureChest extends State {

    start_buy_event(game, player_cards) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
        card_gainer.gain_game_card()
    }
}
