// simulate getting products from DataBase
const products = [];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    success: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
        success: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        success: true,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
        success: false,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError, success }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );
  useEffect(() => {
    console.log("rendering...");

    // doFetch('products')
    console.log("SUCCESS:", success);
    let parsed_data = null;
    if (success) {
      parsed_data = data.map((item) => {
        let new_item = { ...item };
        console.log(typeof item.instock);
        if (typeof item.instock == "string") {
          new_item.instock = parseInt(item.instock);
        }
        return new_item;
      });
    }
    console.log(data);
    success ? console.log(parsed_data) : console.log("");
    console.log(`Rendering Products ${JSON.stringify(data)}`);
    success ? setItems(parsed_data) : setItems([]);
  }, [data]);
  // Fetch Data
  const addToCart = (e) => {
    console.log("Adding to cart");
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log("item to be added to cart:", item[0]);
    let new_cart = addOneItemToCart(cart, item[0]);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    console.log("new cart after addition: ", new_cart);
    let new_product_list = substractOneItemTo(items, item[0]);
    console.log("new items after removal: ", new_product_list);
    let product_list_without_unavailable_products = new_product_list.filter(
      (item) => item.instock > 0
    );
    console.log("after removal: ", product_list_without_unavailable_products);
    setCart(new_cart);
    setItems(product_list_without_unavailable_products);
    // doFetch(query);
  };
  const deleteCartItem = (item) => {
    console.log("#####################  deleteCartItem  #####################");
    let newCart = substractOneItemFromCart(cart, item);
    let newItems = addOneItemTo(items, item);
    let cart_without_unavailable_products = newCart.filter(
      (item) => item.instock > 0
    );
    setCart(cart_without_unavailable_products);
    setItems(newItems);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}: ${item.cost} , {item.instock} available
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    console.log("Cart List calculation: ", item);
    return (
      <Card key={index}>
        <Card.Header>
          {/* <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}> */}
          {/* <Accordion.Toggle> */}
          {item.name}
          {/* </Accordion.Toggle> */}
        </Card.Header>
        <Accordion.Collapse>
          <Card.Body onClick={() => deleteCartItem(item)} eventKey={1 + index}>
            $ {item.cost} of {item.name} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      console.log("Final list calculation", { ...item });
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    console.log(cart);
    console.log(costs);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    console.log("### restocking ####");
    doFetch(url);
    let parsed_data = data.map((item) => {
      let new_item = { ...item };
      if (typeof item.instock == "string") {
        new_item.instock = parseInt(item.instock);
      }
      return new_item;
    });
    let newItems = parsed_data.map((item) => {
      let found = items.filter(
        (filter_item) => filter_item.name == item.name
      );
      console.log(found)
      if (found.length == 0) {
        return item;
      }
      let tmp = { ...item };
      tmp.instock += found[0].instock;
      return tmp;
    });
    setItems(newItems);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));

function addOneItemTo(data, item) {
  console.log("addOneItemTo => item: ", item);
  let tmp_item = { ...item };
  let a = data.filter((datum) => datum.name === item.name);
  if (a.length === 0) {
    tmp_item.instock = 1;
    return [...data, tmp_item];
  }
  let tmp_data = data.map((datum) => {
    if (datum.name === tmp_item.name) {
      let tmp_ = { ...datum };
      tmp_.instock++;
      return tmp_;
    } else {
      return datum;
    }
  });
  return tmp_data;
}

function addOneItemToCart(data, item) {
  console.log("addOneItemToCart => item: ", item);
  let tmp_item = { ...item };

  let a = data.filter((datum) => datum.name === item.name);
  if (a.length === 0) {
    tmp_item.instock = 1;
    return [...data, tmp_item];
  }
  let tmp_data = data.map((datum) => {
    if (datum.name === tmp_item.name) {
      let tmp_ = { ...datum };
      tmp_.instock++;
      tmp_.cost = item.cost * tmp_.instock;
      return tmp_;
    } else {
      return datum;
    }
  });

  return tmp_data;
}

function substractOneItemTo(data, item) {
  return data.map((datum) => {
    if (datum.name === item.name) {
      console.log("found it on products", datum.name);
      let tmp = { ...datum };
      tmp.instock--;
      console.log(tmp);
      return tmp;
    } else {
      return datum;
    }
  });
}

function substractOneItemFromCart(data, item) {
  return data.map((datum) => {
    if (datum.name === item.name) {
      console.log("found it on cart", datum.name);
      let tmp = { ...datum };
      tmp.cost -= item.cost / tmp.instock;
      tmp.instock--;
      console.log(tmp);
      return tmp;
    } else {
      return datum;
    }
  });
}
