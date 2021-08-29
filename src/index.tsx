import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props: {value:number}) {
  return (
    <div className="square">
      {props.value}
    </div>
  );
}

class Board extends React.Component<{size: number}, {size:number, squares: Array<{value:number}>}> {
  constructor(props: {size: number}) {
    super(props);

    this.state = {
      size: props.size,
      squares: Array(props.size*props.size).fill({value: 0})
    };

  }

  // sets up the square after mounting
  componentDidMount() {
    this.makeMagic();
  }

  UNSAFE_componentWillReceiveProps(nextProps: any) {
    this.setState({
      size: nextProps.size,
      squares: Array(nextProps.size*nextProps.size).fill({value: 0})
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

  durerSquares(curNum:number, arr:{value:number}[]) {
    let i     = 0 // row
    let j     = 0 // col
    //const N   = Math.pow(this.state.size / 4, 2); // number of 4x4 squares
    const G   = this.state.size / 4; // number of segments of an individual row or column
    const SEG = this.state.size / G; // the length of each segment
    for (let _i = 0; _i < this.state.size; _i++) {
      for (let _j = 0; _j < this.state.size; _j++) {
        let index = j + this.state.size*i

        let i_norm = this.durerNormToSeg(i, SEG);
        let j_norm = this.durerNormToSeg(j, SEG);

        if (i_norm === 0 || i_norm === 3) { // outer
          if (j_norm === 0 || j_norm === 3) {
            arr[index].value = curNum;
          }
        } else { // inner
          if (j_norm === 1 || j_norm === 2) {
            arr[index].value = curNum;
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

        if (arr[index].value === 0) {
          arr[index].value = curNum;
        }

        curNum++;
        j -= 1;
      }
      j  = this.state.size-1;
      i -= 1;
    }
  }

  gammaPlusTwoSquares(curNum:number, arr:{value:number}[], size:number) {
    // start one right of the centre
    var i = Math.floor(size /2) // row
    var j = Math.floor(size /2) + 1// col
    for (let num = 0; num < size; num++) {
      for (let m = 0; m < size; m++) {
        let index = j + size*i
        arr[index].value = curNum++

        --i; ++j;
        if (i < 0) {
          i = size-1
        }
        if (j >= size) {
          j = 0
        }
      }
      // each time it completes M numbers, move 2 cells right
      j += 1
      ++i // revert i
      if (i >= size) {
        i = 0
      }
      if (j >= size) {
        j = 0 + (j - size)
      }
    }
  }

  brumgnachStracheySquares(curNum:number, arr:{value:number}[]) {
    // first do gamma plus two for A B C and D
    const N:number = this.state.size/2;

    const getSquareAB = (arr:{value:number}[], first:number) => {
      const newArr = Array(N*N).fill({});

      let i_real = first;

      for (let i = 0; i<N; i++) {
        for (let j = 0; j<N; j++) {
          const index = j + N*i;
          const index_real = j + this.state.size*i_real;

          newArr[index] = arr[index_real+first];
        }
        i_real += 1;
      }

      return newArr;
    };

    const getSquareC = (arr:{value:number}[], first:number) => {
      const newArr = Array(N*N).fill({});

      let i_real = first-(N*2);

      for (let i = 0; i<N; i++) {
        for (let j = 0; j<N; j++) {
          const index = j + N*i;
          const index_real = (j + this.state.size*i_real) + (N);

          newArr[index] = arr[index_real];
        }
        i_real += 1;
      }

      return newArr;
    };

    const getSquareD = (arr:{value:number}[], first:number) => {
      const newArr = Array(N*N).fill({});

      let i_real = first/N;

      for (let i = 0; i<N; i++) {
        for (let j = 0; j<N; j++) {
          const index = j + N*i;
          const index_real = (j + this.state.size*i_real);

          newArr[index] = arr[index_real];
        }
        i_real += 1;
      }

      return newArr;
    };

    // initial A B C D setup
    const A = getSquareAB(arr, 0*N);
    const B = getSquareAB(arr, 1*N);
    const C = getSquareC(arr, 2*N);
    const D = getSquareD(arr, N*N);

    // fill in sub matrices
    this.gammaPlusTwoSquares(curNum, A, N); // A
    curNum += (N*N);
    this.gammaPlusTwoSquares(curNum, B, N); // B
    curNum += (N*N);
    this.gammaPlusTwoSquares(curNum, C, N); // C
    curNum += (N*N);
    this.gammaPlusTwoSquares(curNum, D, N); // D

    // Swapping, using the swap by columns method : I am not equiped to adequetly explain these, refer to the paper
    // Swap between A & D
    // swap all cells in the left most column except middle

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const index = j + (N*i);
        if (j === 0) {
          if (i === ((N+1)/2)-1) {
            continue;
          }
          const bottom = D[index].value;

          D[index].value = A[index].value;
          A[index].value = bottom;

        } else if ((this.state.size+2)/4 === (j+1)) {
          if (i === ((N+1)/2)-1) { // swap only middle cell
            const bottom = D[index].value;

            D[index].value = A[index].value;
            A[index].value = bottom;
          }
        }
      }
    }

    // Swap between C + B
    const start:number = (this.state.size - 6) / 4;
    if (start === 0) return;
    for (let col = 1; col <= start; col++) {
      const col_i = N - col; // get rightmost x col

      for (let j = 0; j<N; j++) {
        const index = col_i + (N*j);
        const bottom = C[index].value;
        console.log(index)

        C[index].value = B[index].value;
        B[index].value = bottom;
      }
    }

  }

  makeMagic() {
    // compute magic squares array
    var curNum: number = 1
    var arr            = Array(this.state.size*this.state.size).fill({}).map((el:any) => ({value: 0}))

    if ((this.state.size % 2 === 0) && (this.state.size % 4 === 0)) { // doubly even
      // Durer method
      this.durerSquares(curNum, arr);

  } else if ((this.state.size % 2 === 0) && (this.state.size % 4 !== 0)) { // singly even
      // Brumgnach-Strachey method
      this.brumgnachStracheySquares(curNum, arr);

    } else { // odd
      // gamma plus two
      this.gammaPlusTwoSquares(curNum, arr, this.state.size);
    }

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

    content.push(<div key="sum" style={{marginBottom:"5px"}}>{"Magic Sum: " + ((this.state.size*(this.state.size*this.state.size+1))/2) } </div>)

    for (let i = 0; i < this.state.size; i++) {
      let row: Array<any> = []
      for (let j = 0; j < this.state.size; j++) {
        row.push(<div key={"col-" + i + "-" + j}>{this.renderSquare(this.state.squares[j + this.state.size*i].value)}</div>)
      }
      content.push(<div key={"row-"+i} className="row">{row}</div>)
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
      size: 10,// default magic square size
    };
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
