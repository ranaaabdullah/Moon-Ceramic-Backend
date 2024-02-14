const advanceResults= (model,populate)=> async (req,res,next)=>{
    let query;
    //Copy of req.query
    const reqQuery = { ...req.query };
  
    //Fields to exclude
    const removeFeilds = ["select", "sort", "page", "limit"];
    //loop over removeFeilds and delete them from reqQuery
    removeFeilds.forEach((param) => delete reqQuery[param]);
  
    //Create Query String
    let querystr = JSON.stringify(reqQuery);
  
    //Create operators ($gt,$gte,etc)
    querystr = querystr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
  
    //Finding Resource
    query = model.find(JSON.parse(querystr))
  
    //select Feilds
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
  
    //sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("name");
    }
  
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
  
    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate)

    }
    // console.log(query,'ifqueryyyy');
  
    //Executing query
    const results = await query;
  
    //Pagination Result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.advanceResults = {
        success: true,
        count: results.length,
        pagination,
        data:results
    }
    next();
}


module.exports = advanceResults
