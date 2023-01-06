import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


class JokeList extends Component {
    static defaultProps = {numJokesToGet: 10};

    constructor(props) {
        super(props);
        this.state = {jokes: []};

        this.generateNewJokes = this.generateNewJokes.bind(this);
        this.vote = this.vote.bind(this);
    }

    /* get jokes if there are no jokes */

    componentDidMount() {
        if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
    }

    componentDidUpdate() {
        if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
    }

    async getJokes() {
      try {
          let jokes = this.state.jokes;
          let jokeVotes = {};
          let seenJokes = new Set(jokes.map(joke => joke.id));

          while (jokes.length < this.props.numJokesToGet) {
              let res = await axios.get("https://icanhazdadjoke.com", {
                  headers: { Accept: "application/json" }
              });
              let { status, ...jokeObj } = res.data;

              if (!seenJokes.has(jokeObj.id)) {
                  seenJokes.add(jokeObj.id);
                  jokeVotes[jokeObj.id] = jokeVotes[jokeObj.id] || 0;
                  jokes.push({ ...jokeObj, votes: jokeVotes[jokeObj.id]});
              } else {
                  console.error("duplicate found!");
              }
          }
          this.setState({jokes});
      } catch (e) {
          console.log(e);
      }
    }

    /* empty joke list and then call getJokes */

    generateNewJokes() {
        this.setState(allJokes => ({ jokes: allJokes.jokes.filter(joke => joke.show)}));
    }

    /* change vote for this id by delta (+1 or -1) */

    vote(id, delta) {
        let jokeVotes = {};
        jokeVotes[id] = (jokeVotes[id] || 0) + delta;
        this.setState(allJokes => ({
            jokes: allJokes.jokes.map(joke =>
                joke.id === id ? { ...joke, votes: joke.votes + delta } : joke
            )
        }));
    }

    /* render: either loading spinner or list of sorted jokes. */

    render() {
        let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

        return (
            <div className="JokeList">
                <button className="JokeList-getmore" onClick={this.generateNewJokes}>
                    Get New Jokes
                </button>

                {sortedJokes.map(j => (
                    <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote}/>
                ))}
            </div>
        );
    }
}


export default JokeList;

