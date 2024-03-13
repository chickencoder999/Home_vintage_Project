import React, { useEffect, useState } from "react";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import { getListBestSeller } from "../../../constants/getListBestSeller";

const BestSellers = () => {
  const [bestSeller, setBestSellers] = useState([]);
  //call api để lấy bestSellers
  useEffect(() => {
    //xai axios
    getListBestSeller().then((res) => {
      const { list_best_sellers_interior } = res;
      // console.log(res);
      // console.log(message);
      // console.log(list_best_sellers_interior);
      setBestSellers(list_best_sellers_interior);
    });
  }, []);

  return (
    <div className="w-full pb-20">
      <Heading heading="Our Bestsellers" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {bestSeller.map((product) => (
          <Product
            key={product._id}
            _id={product._id}
            img={product.images[0]}
            productName={product.interior_name}
            price={product.price}
            color={product.color}
            badge={true}
            des={product.description}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
