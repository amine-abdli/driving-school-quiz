export default function Ajouterquestion(){
    return(
        <div>
            <h1>Ajouter une question</h1>
            <form action="">
              <label htmlFor="imagequestion">choiser un image</label>
              <input type="file" name="imagequestion" id="imagequestion" /> <br />
              <label htmlFor="solution">solution de question</label>
              <input type="checkbox" name="solution 1" id="solution 1" value="1" /> 1 <br />
              <input type="checkbox" name="solution 2" id="solution 2" value="1" /> 2 <br />
              <input type="checkbox" name="solution 3" id="solution 3" value="1" /> 3 <br />
              <input type="checkbox" name="solution 4" id="solution 4" value="1" /> 4 <br />

                 <button type="submit">Ajouter</button>
                 <button type="reset">Reset</button>
            </form>
        </div>
    )
}