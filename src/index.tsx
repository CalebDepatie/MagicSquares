import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props: any) {
  return (
    <div className="square">
      {props.value}
    </div>
  );
}

class Board extends React.Component<{size: number}, {size:number, squares: Array<number>}> {
  constructor(props: any) {
    super(props)

    this.state = {
      size: props.size,
      squares: Array(props.size*props.size).fill(0)
    }

    this.setState({size: props.size}, this.makeMagic) // ensure it only attempts to create the magic square after state goes through
  }

  UNSAFE_componentWillReceiveProps(nextProps: any) {
    this.setState({
      size: nextProps.size,
      squares: Array(nextProps.size*nextProps.size).fill(0)
    }, this.makeMagic);
  }

  // get the index with respect to the current 4x4 square (For Durer method)
  durerNormToSeg(i: number, seg_len: number): number {
    if (i < seg_len) {
      return i;
    } else {
      return this.durerNormToSeg(i-seg_len, seg_len);
    }
  }

  makeMagic() {
    // compute magic squares array

    var curNum: number = 1
    var arr            = Array(this.state.size*this.state.size).fill(0)

    // eslint-disable-next-line
    if ((this.state.size % 2 == 0) && (this.state.size % 4 == 0)) { // doubly even
      // Durer method
      let i     = 0 // row
      let j     = 0 // col
      const N   = Math.pow(this.state.size / 4, 2); // number of 4x4 squares
      const G   = this.state.size / 4; // number of segments of an individual row or column
      const SEG = this.state.size / G; // the length of each segment
      for (let _i = 0; _i < this.state.size; _i++) {
        for (let _j = 0; _j < this.state.size; _j++) {
          let index = j + this.state.size*i

          let i_norm = this.durerNormToSeg(i, SEG);
          let j_norm = this.durerNormToSeg(j, SEG);

          //console.log(curNum + ": " + i_norm)

          if (i_norm == 0 || i_norm == 3) { // outer
            if (j_norm == 0 || j_norm == 3) {
              arr[index] = curNum;
            }
          } else { // inner
            if (j_norm == 1 || j_norm == 2) {
              arr[index] = curNum;
            }
          }

          curNum++;
          j += 1;
        }
        j  = 0;
        i += 1;
      }
      // fill in the remaining places moving backwards
      curNum = 1;
      j = this.state.size-1;
      i = this.state.size-1;
      for (let _i = 0; _i < this.state.size; _i++) {
        for (let _j = 0; _j < this.state.size; _j++) {
          let index = j + this.state.size*i

          if (arr[index] == 0) {
            arr[index] = curNum;
          }

          curNum++;
          j -= 1;
        }
        j  = this.state.size-1;
        i -= 1;
      }

    // eslint-disable-next-line
    } else if ((this.state.size % 2 == 0) && (this.state.size % 4 != 0)) { // singly even
      // Brumgnach-Strachey method



    } else { // odd
      // gamma plus two
      // start one right of the centre
      var i = Math.floor(this.state.size /2) // row
      var j = Math.floor(this.state.size /2) + 1// col
      for (let num = 0; num < this.state.size; num++) {
        for (let m = 0; m < this.state.size; m++) {
          let index = j + this.state.size*i
          //console.log(curNum + ": " + i + ", " + j)
          arr[index] = curNum++

          --i; ++j;
          if (i < 0) {
            i = this.state.size-1
          }
          if (j >= this.state.size) {
            j = 0
          }
        }
        // each time it completes M numbers, move 2 cells right
        j += 1
        ++i // revert i
        if (i >= this.state.size) {
          i = 0
        }
        if (j >= this.state.size) {
          j = 0 + (j - this.state.size)
        }
      }
    }

    /*for (let i = 0; i < this.state.size; i++) {
      for (let j = 0; j < this.state.size; j++) {
        let index = j + this.state.size*i

      }
    } */

    this.setState({
      squares: arr
    }, this.render)
  }

  renderSquare(i: number) {
    //console.log(i)
    return <Square
            value={i}
            />;
  }

  render() {
    let content: Array<any> = []

    content.push(<div>{"Magic Sum:" + ((this.state.size*(this.state.size*this.state.size+1))/2) } </div>)

    for (let i = 0; i < this.state.size; i++) {
      let row: Array<any> = []
      for (let j = 0; j < this.state.size; j++) {
        row.push(<div>{this.renderSquare(this.state.squares[j + this.state.size*i])}</div>)
      }
      content.push(<div className="row">{row}</div>)
    }

    return (
      <div>
          {content}
      </div>
    );
  }
}

class Manager extends React.Component<{}, {size: number}> {
  constructor(props: any) {
    super(props)
    this.state = {
      size: 4,// default magic square size
    }
    this.setState({size: 4}, this.render)
  }

  handleChange(evt: any) {
    const size = (evt.target.validity.valid) ? evt.target.value : this.state.size;
    if (size < 3) {
      alert("Size must be atleast 3")
    } else {
      this.setState({size}, this.render);
    }
    //console.log(size)
  }

  render() {
    return (
      <div className="manager">
      {"Enter size of magic square: "}
      <input type="tel" pattern="[0-9]*" onInput={this.handleChange.bind(this)} value={this.state.size} />
        <div className="magic-board">
          <Board
            size={this.state.size}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Manager />,
  document.getElementById('root')
);
