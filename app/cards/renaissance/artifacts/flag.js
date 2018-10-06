Flag = class Flag extends State {

    end_turn_event(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(1)
    }
}
