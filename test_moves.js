// Script to test cube 2D mapping
const FACES = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };
function cycle(state, indices) {
    const temp = state[indices[0]];
    for (let i = 0; i < indices.length - 1; i++) {
        state[indices[i]] = state[indices[i + 1]];
    }
    state[indices[indices.length - 1]] = temp;
}
